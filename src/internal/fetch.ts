import * as Context from 'effect/Context'

type Identity<I> = I;

export interface Fetch extends Identity<typeof globalThis['fetch']> {}

export const Fetch = Context.Tag<Fetch>('effect-fetch/Fetch')