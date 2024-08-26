/**
 * @since 0.0.1
 */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";

import * as Interceptor from "../Interceptor.js";

// Reference: https://github.com/square/okhttp/blob/30780c879bd0d28b49f264fac2fe05da85aef3ad/okhttp-logging-interceptor/src/main/kotlin/okhttp3/logging/HttpLoggingInterceptor.kt#L50C3-L107C4

/**
 * @since 0.0.1
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
  return headers.forEach(([key, value]) => {
    console.log(`${key}: ${headersToRedact.includes(key) ? "██" : value}`);
  });
}

const logger = (level: Level, headersToRedact: string[] = []) => {
  return async function (context: Interceptor.Chain) {
    const request = context.request;

    if (level == Level.NONE) return context.proceed(request);

    const req = request.clone();

    const logBody = level == Level.BODY;
    const logHeaders = logBody || level == Level.HEADERS;

    const method = req.init?.method ?? "GET";
    let msg = `--> ${method} ${req.url}`;

    if (!logHeaders && req.init?.body) {
      // incase we get an invalid url while running in node
      const mock = new Request("www.google.com", req.init);

      const content = await TE.tryCatch(() => mock.text(), E.toError)();

      if (E.isRight(content)) {
        msg += ` (${content.right.length}-byte body)`;
      }
    }

    console.log(msg);

    if (logHeaders && req.init?.headers) {
      logHeader(new Headers(req.init.headers), headersToRedact);
    }

    console.log(`--> END ${method}`);

    let startNs = Date.now();
    let result = await context.proceed(req);

    if (E.isLeft(result)) {
      console.log(`<-- HTTP FAILED: ${String(result.left)}`);
    } else {
      const tookMs = Date.now() - startNs;
      const response = result.right;
      const res = response.clone();

      console.log(
        `<-- ${res.status} ${res.statusText} ${res.url} (${tookMs}ms)`
      );

      if (logHeaders) {
        logHeader(res.headers, headersToRedact);
      }
    }

    if (!logBody) {
      console.log("<-- END HTTP");
    }

    return result;
  };
};

export {
  /**
   * @since 0.0.1
   * @category interceptor
   */
  logger as Logger
};

