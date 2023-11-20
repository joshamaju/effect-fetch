/**
 * @since 1.0.0
 */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as List from "effect/List";
import * as Logger from "effect/Logger";

import { Interceptor } from "../internal/interceptor.js";

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

function logHeader(headers: Headers, headersToRedact: string[]) {
  return Effect.forEach(headers, ([key, value]) => {
    return Effect.log(`${key}: ${headersToRedact.includes(key) ? "██" : value}`)
  })
}

/**
 * @since 1.0.0
 */
const logger = (level: Level): Interceptor => {
  return (context) => {
    return Effect.gen(function* (_) {
      const request = context.request();

      if (level == Level.NONE) {
        return yield* _(context.proceed(request));
      }

      const req = request.clone();

      const logBody = level == Level.BODY;
      const logHeaders = logBody || level == Level.HEADERS;

      let msg = `--> ${req.method} ${req.url}`;

      if (!logHeaders && req.body) {
        const content = yield* _(req.text());
        msg += ` (${content.length}-byte body)`;
      }

      yield* _(Effect.log(msg));

      if (logHeaders) {
        for (let [key, value] of req.headers) {
          yield* _(Effect.log(key + ": " + value));
        }
      }

      yield* _(Effect.log(`--> END ${req.method}`));

      let startNs = Date.now();
      let result = yield* _(context.proceed(req), Effect.exit);

      if (Exit.isFailure(result)) {
        yield* _(Effect.log(`<-- HTTP FAILED: ${Cause.pretty(result.cause)}`));
        throw result.cause;
      }

      const tookMs = Date.now() - startNs;
      const response = result.value
      const res = response.clone();

      yield* _(Effect.log(`<-- ${res.status} ${res.statusText} ${res.url} (${tookMs}ms)`));

      if (logHeaders) {
        for (let [key, value] of res.headers) {
          yield* _(Effect.log(key + ": " + value));
        }
      }

      if (!logBody) {
        yield* _(Effect.log("<-- END HTTP"))
      }

      return response;
    }).pipe(
      Effect.withLogSpan("time"),
      Effect.provide(Logger.replace(Logger.defaultLogger, stringLogger))
    );
  };
};

export const stringLogger = Logger.make(
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

export { logger as Logger };
