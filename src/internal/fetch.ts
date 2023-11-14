import * as Effect from 'effect/Effect';
import * as Context from 'effect/Context'
import { HttpError } from './error.js';
import { HttpRequest } from './request.js';

export interface Fetch {
    (url: string | URL | HttpRequest, init?: RequestInit): Effect.Effect<never, HttpError, Response>
}

export const Fetch = Context.Tag<Fetch>('effect-fetch/Fetch')