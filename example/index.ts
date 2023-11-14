import * as Effect from 'effect/Effect'
import { pipe } from 'effect/Function'

import * as Fetch from '../src/Fetch.js'
import * as Result from '../src/Response.js'
import * as Interceptor from '../src/Interceptor.js'

import * as AdapterFetch from '../src/adapters/fetch.js'

const program = Effect.gen(function*(_) {
    const result = yield* _(Fetch.fetch_('/users'))
    const users = yield* _(result.json())
})

const FetchLive = Fetch.effect(Interceptor.make(AdapterFetch.fetch))

const result = pipe(program, Effect.provide(FetchLive), Effect.runSync)