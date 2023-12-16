import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as Cause from "effect/Cause";
import * as Chunk from 'effect/Chunk'
import * as Option from 'effect/Option'
import { dual } from "effect/Function";

import { HttpError } from "./error.js";
import { Fetch } from "../Fetch.js";
import { HttpRequest } from "./request.js";

export interface Context {
  request: HttpRequest;
  proceed(request: HttpRequest): Effect.Effect<never, HttpError, Response>;
}

export interface Interceptor<R, E>
  extends Effect.Effect<R | Context, E, Response> {}

export type Interceptors<R, E> = Chunk.Chunk<Interceptor<R, E>>;

export type Merge<
  I extends Interceptors<any, any>,
  T extends Interceptor<any, any>,
> = I extends Interceptors<infer R1, infer E1>
  ? T extends Interceptor<infer R2, infer E2>
    ? Interceptors<R1 | R2, E1 | E2>
    : never
  : never;

export const Context = Tag<Context>();

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
            Cause.RuntimeException("proceed() called multiple times")
          );
        }

        index = i;

        let handler = Option.getOrNull(Chunk.get(interceptors, i))

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
