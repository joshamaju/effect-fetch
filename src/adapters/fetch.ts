import * as Effect from 'effect/Effect'
import { Fetch } from '../internal/fetch.js'
import { HttpError } from '../internal/error.js'
import { HttpRequest } from '../internal/request.js'

const fetch_: Fetch = (url, init) => {
    return Effect.tryPromise({
        try: () => url instanceof HttpRequest ? fetch(url.request) : fetch(url, init),
        catch: (error) => new HttpError(error)
    })
}

export {fetch_ as fetch}