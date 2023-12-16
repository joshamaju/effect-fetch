/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import { Layer } from "effect/Layer";
import { Tag } from "effect/Context";

import * as internal from "./internal/fetch.js";
import { HttpError } from "./internal/error.js";
import { HttpResponse } from "./internal/response/index.js";
import { HttpRequest } from "./internal/request.js";

/**
 * @since 1.0.0
 * @category model
 */
export interface Fetch {
  (
    url: string | URL | HttpRequest,
    init?: RequestInit
  ): Effect<never, HttpError, Response>;
}

/**
 * @since 1.0.0
 * @category tag
 */
export const Fetch = Tag<Fetch>("effect-fetch/Fetch");

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
) => Effect<Fetch, HttpError, HttpResponse> = internal.fetch_;

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
export const effect: <R, E>(fetch: Effect<R, E, Fetch>) => Layer<R, E, Fetch> =
  internal.effect;
