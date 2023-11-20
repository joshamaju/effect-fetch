/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import * as internal from "./internal/fetch.js";
import { Fetch } from "./internal/fetch.js";
import { HttpError } from "./internal/error.js";
import { HttpResponse } from "./internal/response/index.js";
import { Layer } from "effect/Layer";

/**
 * @since 1.0.0
 * @category constructors
 */
export const fetch: (
  url: string | URL,
  init?: RequestInit | undefined
) => Effect<Fetch, HttpError, Response> = internal.fetch;

/**
 * Constructs a request whose response is a `Response` wrapper with the decode methods replace with their `Effect` conterparts
 *
 * @since 1.0.0
 * @category constructors
 */
export const fetch_: (
  url: string | URL,
  init?: RequestInit | undefined
) => Effect<internal.Fetch, HttpError, HttpResponse> = internal.fetch_;

/**
 * Constructs a `Fetch` layer using the given platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: (fetch: Fetch) => Layer<never, never, Fetch> = internal.make;

/**
 * Constructs a `Fetch` layer from the specified effect that produces the given platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect: <R, E>(
  fetch: Effect<R, E, Fetch>
) => Layer<R, E, Fetch> = internal.makeEffect;
