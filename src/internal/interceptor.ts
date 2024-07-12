import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Option from "effect/Option";

import { Adapter, Fetch } from "../Fetch.js";
import { Context, Interceptors } from "../Interceptor.js";
import { HttpError } from "./error.js";
import { HttpRequest } from "./request.js";

export function compose(initiator: Effect.Effect<Response, any, Context>) {
  return <E, R>(interceptors: Interceptors<E, R>) =>
    (request: HttpRequest) => {
      let index = -1;

      function dispatch(
        i: number,
        request: HttpRequest
      ): Effect.Effect<Response, HttpError, never> {
        if (i <= index) {
          return Effect.die(
            new Cause.RuntimeException("proceed() called multiple times")
          );
        }

        index = i;

        let handler = Option.getOrNull(Chunk.get(interceptors, i));

        if (!handler || i === interceptors.length) {
          handler = initiator;
        }

        const context = Context.of({
          request,
          proceed: (newRequest) => dispatch(i + 1, newRequest),
        });

        // @ts-expect-error
        return handler.pipe(Effect.provideService(Context, context));
      }

      return dispatch(0, request);
    };
}

export const intercept = <E, R>(interceptors: Interceptors<E, R>) => {
  return Effect.gen(function* () {
    const fetch = yield* Fetch;

    const handler = compose(
      Effect.gen(function* () {
        const { request } = yield* Context;
        const { url, init } = request;
        return yield* fetch(url, init);
      })
    );

    const run = handler(interceptors);

    return Fetch.of((...args) => run(new HttpRequest(...args)));
  });
};

export const makeAdapter = dual<
  <E, R>(
    interceptors: Interceptors<E, R>
  ) => (fetch: Adapter) => Effect.Effect<Adapter, E, Exclude<R, Context>>,
  <E, R>(
    fetch: Adapter,
    interceptors: Interceptors<E, R>
  ) => Effect.Effect<Adapter, E, Exclude<R, Context>>
>(2, (fetch, interceptors) => {
  return intercept(interceptors).pipe(Effect.provideService(Fetch, fetch));
});

export const copy = <E, R>(interceptors: Interceptors<E, R>) => {
  return Chunk.unsafeFromArray([...Chunk.toArray(interceptors)]);
};
