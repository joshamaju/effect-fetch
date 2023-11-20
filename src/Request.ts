/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";
import { DecodeError } from "./internal/error.js";
import * as internal from "./internal/request.js";
import { Body } from "./internal/body.js";

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (
  url: string | URL,
  init?: RequestInit | undefined
) => Request = internal.make;

/**
 * @since 1.0.0
 * @category mapping
 */
export const map: {
  <B>(fn: (request: Request) => B): (request: Request) => B;
  <B>(request: Request, fn: (request: Request) => B): B;
} = internal.map;

/**
 * @since 1.0.0
 * @category mapping
 */
export const appendBody: (body: Body) => (request: internal.HttpRequest) => Request = internal.appendBody

/**
 * @since 1.0.0
 * @category combinators
 */
export const json: (value: Request) => Effect<never, DecodeError, any> =
  internal.json;

/**
 * @since 1.0.0
 * @category combinators
 */
export const text: (value: Request) => Effect<never, DecodeError, string> =
  internal.text;

/**
 * @since 1.0.0
 * @category combinators
 */
export const blob: (value: Request) => Effect<never, DecodeError, Blob> =
  internal.blob;

/**
 * @since 1.0.0
 * @category combinators
 */
export const formData: (
  value: Request
) => Effect<never, DecodeError, FormData> = internal.formData;

/**
 * @since 1.0.0
 * @category combinators
 */
export const arrayBuffer: (
  value: Request
) => Effect<never, DecodeError, ArrayBuffer> = internal.arrayBuffer;
