import * as internal from "./internal/fetch.js";

/**
 * @since 1.0.0
 * @category constructors
 */
export const fetch = internal.fetch;

/**
 * Constructs a request whose response is a `Response` wrapper with the decode methods replace with their `Effect` conterparts
 *
 * @since 1.0.0
 * @category constructors
 */
export const fetch_ = internal.fetch_;

/**
 * Constructs a `Fetch` layer using the given platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = internal.make;

/**
 * Constructs a `Fetch` layer from the specified effect that produces the given platform adapter
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect = internal.makeEffect;
