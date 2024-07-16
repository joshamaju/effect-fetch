import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

import { Adapter, Fetch } from "../Fetch.js";
import { Chain, Interceptors } from "../Interceptor.js";
import { HttpError } from "./error.js";
import { HttpRequest } from "./request.js";

export function compose(initiator: Effect.Effect<Response, any, Chain>) {
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

        const chain = Chain.of({
          request,
          proceed: (req) => dispatch(i + 1, req),
        });

        // @ts-expect-error
        return handler.pipe(Effect.provideService(Chain, chain));
      }

      return dispatch(0, request);
    };
}

export const make = <E, R>(interceptors: Interceptors<E, R>) => {
  return Effect.gen(function* () {
    const fetch = yield* Fetch;

    const handler = compose(
      Effect.gen(function* () {
        const { request } = yield* Chain;
        return yield* fetch(request.url, request.init);
      })
    );

    const run = handler(interceptors);

    return Fetch.of((...args) => run(new HttpRequest(...args)));
  });
};

export const provide = <E, R>(
  interceptor: Effect.Effect<Adapter, E, R | Fetch>,
  fetch: Adapter,
) => {
  return interceptor.pipe(Effect.provideService(Fetch, fetch));
};

export const copy = <E, R>(interceptors: Interceptors<E, R>) => {
  return Chunk.unsafeFromArray([...Chunk.toArray(interceptors)]);
};
