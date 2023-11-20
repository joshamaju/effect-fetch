/**
 * @since 1.0.0
 */
import { Effect } from "effect/Effect";
import * as internal from "./internal/response/index.js";
import { DecodeError } from "./internal/error.js";

/**
 * @since 1.0.0
 * @category combinators
 */
export const json: (value: Response) => Effect<never, DecodeError, any> =
  internal.json;

/**
 * @since 1.0.0
 * @category combinators
 */
export const text: (value: Response) => Effect<never, DecodeError, string> =
  internal.text;

/**
 * @since 1.0.0
 * @category combinators
 */
export const blob: (value: Response) => Effect<never, DecodeError, Blob> =
  internal.blob;

/**
 * @since 1.0.0
 * @category combinators
 */
export const formData: (
  value: Response
) => Effect<never, DecodeError, FormData> = internal.formData;

/**
 * @since 1.0.0
 * @category combinators
 */
export const arrayBuffer: (
  value: Response
) => Effect<never, DecodeError, ArrayBuffer> = internal.arrayBuffer;
