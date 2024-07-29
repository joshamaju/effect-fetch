/**
 * @since 2.1.0
 */
import * as Effect from "effect/Effect";

import * as Interceptor from "../Interceptor.js";

/**
 * @since 2.1.0
 * @category interceptor
 */
export const Tracer = (headersToRedact: string[]) => {
  return Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;

    const req = chain.request.clone();

    const span = yield* Effect.makeSpan("effect-fetch");

    const url = req.url instanceof URL ? req.url : new URL(req.url);

    span.attribute("http.request.method", req.init?.method);
    span.attribute("server.address", url.origin);

    if (url.port !== "") span.attribute("server.port", +url.port);

    span.attribute("url.full", url.toString());
    span.attribute("url.path", url.pathname);
    span.attribute("url.scheme", url.protocol.slice(0, -1));

    const query = url.search.slice(1);
    if (query !== "") span.attribute("url.query", query);

    const headers = new Headers(req.init?.headers);

    for (const name in headers) {
      if (!headersToRedact.includes(name)) {
        span.attribute(
          `http.request.header.${name}`,
          String(headers.get(name))
        );
      }
    }

    let response = yield* chain.proceed(chain.request);

    span.attribute("http.response.status_code", response.status);

    const resHeaders = response.headers;

    for (const name in resHeaders) {
      if (!headersToRedact.includes(name)) {
        span.attribute(
          `http.response.header.${name}`,
          String(resHeaders.get(name))
        );
      }
    }

    Effect.annotateLogs({
      package: "effect-fetch",
      module: "Interceptor/Tracer",
    });

    return response;
  });
};
