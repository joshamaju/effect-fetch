/**
 * @since 1.0.0
 */
import type { Effect } from "effect/Effect";

import { DecodeError } from "./internal/error.js";
import * as internal from "./internal/request.js";
import { Body } from "./internal/body.js";
import { HttpRequest } from "./internal/request.js";

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (url: string | URL, init?: RequestInit) => HttpRequest = internal.make

/**
 * @since 1.0.0
 * @category mapping
 */
export const map: {
  <B>(fn: (request: HttpRequest) => B): (request: HttpRequest) => B;
  <B>(request: HttpRequest, fn: (request: HttpRequest) => B): B;
} = internal.map;

/**
 * @since 1.0.0
 * @category mapping
 */
export const appendBody: (body: Body) => (request: HttpRequest) => Request = internal.appendBody

/**
 * @since 1.0.0
 * @category combinators
 */
export const json: (value: Request) => Effect<any, DecodeError, never> =
  internal.json;

/**
 * @since 1.0.0
 * @category combinators
 */
export const text: (value: Request) => Effect<string, DecodeError, never> =
  internal.text;

/**
 * @since 1.0.0
 * @category combinators
 */
export const blob: (value: Request) => Effect<Blob, DecodeError, never> =
  internal.blob;

/**
 * @since 1.0.0
 * @category combinators
 */
export const formData: (
  value: Request
) => Effect<FormData, DecodeError, never> = internal.formData;

/**
 * @since 1.0.0
 * @category combinators
 */
export const arrayBuffer: (
  value: Request
) => Effect<ArrayBuffer, DecodeError, never> = internal.arrayBuffer;
