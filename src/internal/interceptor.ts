import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as Option from "effect/Option";

import { Fetch } from "../Fetch.js";
import { Context, Interceptors } from "../Interceptor.js";
import { HttpError } from "./error.js";
import { HttpRequest } from "./request.js";

export function compose(initiator: Effect.Effect<Context, any, Response>) {
  return <R, E>(interceptors: Interceptors<R, E>) =>
    (request: HttpRequest) => {
      let index = -1;

      function dispatch(
        i: number,
        request: HttpRequest
      ): Effect.Effect<never, HttpError, Response> {
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

export const intercept = <R, E>(interceptors: Interceptors<R, E>) => {
  return Effect.gen(function* (_) {
    const fetch = yield* _(Fetch);

    const handler = compose(
      Effect.gen(function* (_) {
        const { request } = yield* _(Context);
        const { url, init } = request;
        return yield* _(fetch(url, init));
      })
    );

    const run = handler(interceptors);

    return Fetch.of((...args) => run(new HttpRequest(...args)));
  });
};

export const makeAdapter = dual<
  <R, E>(
    interceptors: Interceptors<R, E>
  ) => (fetch: Fetch) => Effect.Effect<Exclude<R, Context>, E, Fetch>,
  <R, E>(
    fetch: Fetch,
    interceptors: Interceptors<R, E>
  ) => Effect.Effect<Exclude<R, Context>, E, Fetch>
>(2, (fetch, interceptors) => {
  return intercept(interceptors).pipe(Effect.provideService(Fetch, fetch));
});

export const copy = <R, E>(interceptors: Interceptors<R, E>) => {
  return Chunk.unsafeFromArray([...Chunk.toArray(interceptors)])
}