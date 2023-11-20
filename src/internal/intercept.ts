import * as Effect from 'effect/Effect';
import { HttpError } from './error.js';
import { HttpRequest } from './request.js';
import { Fetch } from './fetch.js';

export interface Context {
    request(): HttpRequest
    proceed(request: HttpRequest): Effect.Effect<never, HttpError, Response>;
}

export type Interceptor<E = any> = (context: Context) => Effect.Effect<never, E | HttpError, Response>;

export function compose(
    initiator: (context: Context) => Effect.Effect<never, HttpError, Response>
) {
    return (interceptors: Array<Interceptor>) => (request: HttpRequest) => {
        let index = -1;

        function dispatch(
            i: number,
            request: HttpRequest
        ): Effect.Effect<never, any, Response> {
            return Effect.gen(function* (_) {
                if (i <= index) {
                    throw new Error("next() called multiple times");
                    // throw Cause.as(new Error("next() called multiple times"))
                }

                index = i;

                // let handler = flow(interceptors[i], Effect.catchAll((error) => Effect.die(Cause.as(error))))
                let handler = interceptors[i]

                if (!handler || i === interceptors.length) {
                    handler = initiator;
                }

                return yield* _(
                    handler({
                        request: () => request,
                        proceed: (newRequest) =>
                            dispatch(i + 1, newRequest)
                    })
                );
            });
        }

        return dispatch(0, request);
    };
}

export const intercept = (...interceptors: Array<Interceptor>) => {
    return Effect.gen(function* (_) {
        const fetch = yield* _(Fetch)

        const handler = compose(({request}) => {
            const { url, init } = request();
            return fetch(url, init)
        })

        const run = handler(interceptors)

        return Fetch.of((...args) => run(new HttpRequest(...args)))
    })
}

export const provide = (fetch: Fetch, ...interceptors: Array<Interceptor>) => {
    return intercept(...interceptors).pipe(Effect.provideService(Fetch, fetch))
}