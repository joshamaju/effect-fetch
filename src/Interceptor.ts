import * as Effect from 'effect/Effect'

import { Fetch } from "./internal/fetch.js"
import { Interceptor, compose } from "./internal/intercept.js"
import { HttpRequest } from './internal/request.js'

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

export const make = (fetch: Fetch, ...interceptors: Array<Interceptor>) => {
    return intercept(...interceptors).pipe(Effect.provideService(Fetch, fetch))
}