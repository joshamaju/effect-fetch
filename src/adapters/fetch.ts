import * as Effect from 'effect/Effect'
import { Fetch } from '../internal/fetch.js'
import { HttpError } from '../internal/error.js'

const fetch_: Fetch = (url, init) => Effect.tryPromise({
    try: () => fetch(url, init),
    catch: (error) => new HttpError(error)
})

export {fetch_ as fetch}