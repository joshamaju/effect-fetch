/**
 * @since 1.0.0
 */
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as List from "effect/List";
import * as Logger from "effect/Logger";
import * as Interceptor from "../Interceptor.js";

// Reference: https://github.com/square/okhttp/blob/30780c879bd0d28b49f264fac2fe05da85aef3ad/okhttp-logging-interceptor/src/main/kotlin/okhttp3/logging/HttpLoggingInterceptor.kt#L50C3-L107C4

/**
 * @since 1.0.0
 * @category model
 */
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
    return Effect.log(
      `${key}: ${headersToRedact.includes(key) ? "██" : value}`
    );
  });
}

const logger = (level: Level, headersToRedact: string[] = []) => {
  return Effect.gen(function* () {
    const context = yield* Interceptor.Context;
    const request = context.request;

    if (level == Level.NONE) {
      return yield* context.proceed(request);
    }

    const req = request.clone();

    const logBody = level == Level.BODY;
    const logHeaders = logBody || level == Level.HEADERS;

    const method = req.init?.method ?? "GET";
    let msg = `--> ${method} ${req.url}`;

    if (!logHeaders && req.init?.body) {
      // incase we get an invalid url while running in node
      const mock = new Request("www.google.com", req.init);

      const content = yield* Effect.exit(Effect.tryPromise(() => mock.text()));

      if (Exit.isSuccess(content)) {
        msg += ` (${content.value.length}-byte body)`;
      }
    }

    yield* Effect.log(msg);

    if (logHeaders && req.init?.headers) {
      yield* logHeader(new Headers(req.init.headers), headersToRedact);
    }

    yield* Effect.log(`--> END ${method}`);

    let startNs = Date.now();
    let result = yield* Effect.exit(context.proceed(req));

    if (Exit.isFailure(result)) {
      yield* Effect.log(`<-- HTTP FAILED: ${Cause.pretty(result.cause)}`);
      throw result.cause;
    }

    const tookMs = Date.now() - startNs;
    const response = result.value;
    const res = response.clone();

    yield* Effect.log(
      `<-- ${res.status} ${res.statusText} ${res.url} (${tookMs}ms)`
    );

    if (logHeaders) {
      yield* logHeader(res.headers, headersToRedact);
    }

    if (!logBody) {
      yield* Effect.log("<-- END HTTP");
    }

    return response;
  }).pipe(Effect.provide(Logger.replace(Logger.defaultLogger, stringLogger)));
};

const stringLogger = Logger.make(
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

    if (HashMap.size(annotations) > 0) {
      output = output + " ";

      let first = true;

      for (const [key, value] of annotations) {
        if (first) {
          first = false;
        } else {
          output = output + " ";
        }

        // output = output + filterKeyName(key);
        output = output + `[${key}:${serializeUnknown(value)}]`;
      }
    }

    const strMessage = message as string;

    if (strMessage.length > 0) {
      output = output + " " + strMessage;
    }

    console.log(output);
  }
);

const serializeUnknown = (u: unknown): string => {
  try {
    return typeof u === "object" ? JSON.stringify(u) : String(u);
  } catch (_) {
    return String(u);
  }
};

export {
  /**
   * @since 1.0.0
   * @category interceptor
   */
  logger as Logger,
};
