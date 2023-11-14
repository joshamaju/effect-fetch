import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { Fetch } from './internal/fetch.js'
import { flow } from 'effect/Function'
import { HttpResponse } from './Response.js'

export const fetch = (url: string | URL, init?: RequestInit) => Effect.flatMap(Fetch, fetch_ => fetch_(url, init))

export const fetch_ = flow(fetch, Effect.map(response => new HttpResponse(response)))

export const make = (fetch: Fetch) => Layer.succeed(Fetch, fetch)

export const effect = <R, E>(fetch: Effect.Effect<R, E, Fetch>) => Layer.effect(Fetch, fetch)