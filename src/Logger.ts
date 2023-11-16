import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as L from "effect/Logger";
import * as LL from "effect/LogLevel";
import * as List from "effect/List";
import * as LogSpan from "effect/LogSpan";
import * as FiberId from "effect/FiberId";
import * as Cause from "effect/Cause";
import * as HashMap from "effect/HashMap";

import { Interceptor } from "./internal/intercept.js";
import { HttpRequest } from "./internal/request.js";
import { json, text } from "./Response.js";
import { pipe } from "effect/Function";

// https://github.com/square/okhttp/blob/30780c879bd0d28b49f264fac2fe05da85aef3ad/okhttp-logging-interceptor/src/main/kotlin/okhttp3/logging/HttpLoggingInterceptor.kt#L50C3-L107C4
export enum Level {
  /** No logs. */
  NONE,

  /**
   * Logs request and response lines.
   *
   * Example:
   * ```
   * --> POST /greeting http/1.1 (3-byte body)
   *
   * <-- 200 OK (22ms, 6-byte body)
   * ```
   */
  BASIC,

  /**
   * Logs request and response lines and their respective headers.
   *
   * Example:
   * ```
   * --> POST /greeting http/1.1
   * Host: example.com
   * Content-Type: plain/text
   * Content-Length: 3
   * --> END POST
   *
   * <-- 200 OK (22ms)
   * Content-Type: plain/text
   * Content-Length: 6
   * <-- END HTTP
   * ```
   */
  HEADERS,

  /**
   * Logs request and response lines and their respective headers and bodies (if present).
   *
   * Example:
   * ```
   * --> POST /greeting http/1.1
   * Host: example.com
   * Content-Type: plain/text
   * Content-Length: 3
   *
   * Hi?
   * --> END POST
   *
   * <-- 200 OK (22ms)
   * Content-Type: plain/text
   * Content-Length: 6
   *
   * Hello!
   * <-- END HTTP
   * ```
   */
  BODY,
}

function bodyHasUnknownEncoding(headers: Headers): Boolean {
  const contentEncoding = headers.get("Content-Encoding");

  if (!contentEncoding) return false;

  return (
    contentEncoding.toLowerCase() != "identity" &&
    contentEncoding.toLowerCase() != "gzip"
  );
}

function bodyIsStreaming(response: Response): Boolean {
  const contentType = response.headers.get("Content-Type");

  if (!contentType) return false;

  const [type, subtype] = contentType.split("/");
  return contentType != null && type == "text" && subtype == "event-stream";
}

// function logHeader(headers: Headers, i: number) {
//   const value = if (headers.name(i) in headersToRedact) "██" ? headers.value(i)
//   logger.log(headers.name(i) + ": " + value)
// }

export const Logger = (level: Level): Interceptor => {
  return (context) => {
    return Effect.gen(function* (_) {
      const req = context.request();

      yield* _(Effect.logError("cause", Cause.die(new Error("message"))));

      yield* _(Effect.log("here").pipe(Effect.annotateLogs("key", "hey")));

      if (level == Level.NONE) {
        return yield* _(context.proceed(req));
      }

      const request = req.clone();
      const url = new URL(request.url);

      const logBody = level == Level.BODY;
      const logHeaders = logBody || level == Level.HEADERS;

      const requestBody = request.body;

      let requestStartMessage = `--> ${request.method} ${request.url}`;

      const requestContent = yield* _(request.text());

      if (!logHeaders && requestBody != null) {
        requestStartMessage += ` (${requestContent.length}-byte body)`;
      }

      yield* _(Effect.log(requestStartMessage));

      if (logHeaders) {
        const headers = request.headers;

        if (requestBody != null) {
          // Request body headers are only present when installed as a network interceptor. When not
          // already present, force them to be included (if available) so their values are known.
          const requestContentType = request.headers.get("Content-Type");

          if (!requestContentType) {
            yield* _(Effect.log(`Content-Type: ${requestContentType}`));
          }

          if (requestContent.length != 0) {
            if (headers.get("Content-Length") == null) {
              yield* _(Effect.log(`Content-Length: ${requestContent.length}`));
            }
          }
        }

        for (let [key, value] of headers) {
          yield* _(Effect.log(key + ": " + value));
        }

        if (!logBody || requestBody == null) {
          yield* _(Effect.log(`--> END ${request.method}`));
        } else if (bodyHasUnknownEncoding(request.headers)) {
          yield* _(
            Effect.log(`--> END ${request.method} (encoded body omitted)`)
          );
        }
        // else if (requestBody.isDuplex()) {
        //   logger.log("--> END ${request.method} (duplex request body omitted)")
        // } else if (requestBody.isOneShot()) {
        //   logger.log("--> END ${request.method} (one-shot body omitted)")
        // } else {
        //   var buffer = Buffer()
        //   requestBody.writeTo(buffer)

        //   var gzippedLength: Long? = null
        //   if ("gzip".equals(headers["Content-Encoding"], ignoreCase = true)) {
        //     gzippedLength = buffer.size
        //     GzipSource(buffer).use { gzippedResponseBody ->
        //       buffer = Buffer()
        //       buffer.writeAll(gzippedResponseBody)
        //     }
        //   }

        //   val charset: Charset = requestBody.contentType().charsetOrUtf8()

        //   logger.log("")
        //   if (!buffer.isProbablyUtf8()) {
        //     logger.log(
        //       "--> END ${request.method} (binary ${requestBody.contentLength()}-byte body omitted)"
        //     )
        //   } else if (gzippedLength != null) {
        //     logger.log("--> END ${request.method} (${buffer.size}-byte, $gzippedLength-gzipped-byte body)")
        //   } else {
        //     logger.log(buffer.readString(charset))
        //     logger.log("--> END ${request.method} (${requestBody.contentLength()}-byte body)")
        //   }
        // }
      }

      let startNs = Date.now();
      let result = yield* _(context.proceed(req), Effect.exit);

      if (Exit.isFailure(result)) {
        yield* _(Effect.log("<-- HTTP FAILED: $e"));
        throw result.cause;
      }

      const tookMs = Date.now() - startNs;

      const response = result.value.clone();
      const responseBody = response.body;
      const responseContent = yield* _(text(response));
      const contentLength = responseContent.length;

      let _url = new URL(response.url);

      const encoding = response.headers.get("Content-Encoding");

      const bodySize =
        contentLength != 0 ? `${contentLength}-byte` : "unknown-length";

      yield* _(
        Effect.log(
          `<-- ${response.status}${
            response.statusText.length == 0 ? "" : " " + response.statusText
          } ${response.url} (${tookMs}ms${
            !logHeaders ? `, ${bodySize} body` : ""
          })`
        )
      );

      if (logHeaders) {
        const headers = response.headers;

        for (let [key, value] of headers) {
          yield* _(Effect.log(key + ": " + value));
        }

        if (!logBody || responseContent.length != 0) {
          yield* _(Effect.log("<-- END HTTP"));
        } else if (bodyHasUnknownEncoding(response.headers)) {
          yield* _(Effect.log("<-- END HTTP (encoded body omitted)"));
        } else if (bodyIsStreaming(response)) {
          yield* _(Effect.log("<-- END HTTP (streaming)"));
        } else {
          // const source = responseBody.source()
          // source.request(Long.MAX_VALUE) // Buffer the entire body.

          const totalMs = Date.now() - startNs;

          // const buffer = source.buffer

          let gzippedLength: number | null = null;

          //   if ("gzip".equals(headers["Content-Encoding"], ignoreCase = true)) {
          //     gzippedLength = buffer.size
          //     GzipSource(buffer.clone()).use { gzippedResponseBody ->
          //       buffer = Buffer()
          //       buffer.writeAll(gzippedResponseBody)
          //     }
          //   }

          //   const charset = responseBody.contentType().charsetOrUtf8()

          // if (!buffer.isProbablyUtf8()) {
          //   yield* _(Effect.log(""))
          //   yield* _(Effect.log(`<-- END HTTP (${totalMs}ms, binary ${buffer.size}-byte body omitted)`))
          //   return result
          // }

          if (contentLength != 0) {
            yield* _(Effect.log(""));
            yield* _(Effect.log(responseContent));
          }

          // if (gzippedLength != null) {
          //   yield* _(Effect.log("<-- END HTTP (${totalMs}ms, ${buffer.size}-byte, $gzippedLength-gzipped-byte body)"))
          // } else {
          //   yield* _(Effect.log(`<-- END HTTP (${totalMs}ms, ${buffer.size}-byte body)`))
          // }
        }
      }

      return result.value;
    }).pipe(
      Effect.withLogSpan("time"),
      Effect.provide(L.replace(L.defaultLogger, stringLogger))
    );
  };
};

export const stringLogger = L.make(
  ({ annotations, cause, date, logLevel, message, spans }) => {
    const nowMillis = date.getTime();

    let output = `${date.toISOString()} [${logLevel.label}]`;

    if (cause != null && cause._tag !== "Empty") {
      output = output + " " + Cause.pretty(cause);
    }

    if (List.isCons(spans)) {
      output = output + " ";

      let first = true;

      for (const span of spans) {
        if (first) {
          first = false;
        } else {
          output = output + " ";
        }

        const label = span.label.replace(/[\s="]/g, "_");
        output = output + `[${label}:${nowMillis - span.startTime}ms]`;
      }
    }

    if (pipe(annotations, HashMap.size) > 0) {
      output = output + " ";

      let first = true;

      for (const [key, value] of annotations) {
        if (first) {
          first = false;
        } else {
          output = output + " ";
        }

        // output = output + filterKeyName(key);
        output = output + "[" + key + ":" + serializeUnknown(value) + "]";
      }
    }

    const stringMessage = serializeUnknown(message);

    if (stringMessage.length > 0) {
      output = output + " " + stringMessage;
    }

    console.log(output);

    // return output
  }
);

export const serializeUnknown = (u: unknown): string => {
  try {
    return typeof u === "object" ? JSON.stringify(u) : String(u);
  } catch (_) {
    return String(u);
  }
};

const filterKeyName = (key: string) => key.replace(/[\s="]/g, "_");
