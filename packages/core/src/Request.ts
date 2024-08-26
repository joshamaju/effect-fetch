/**
 * @since 0.0.1
 */
import { Either } from "fp-ts/Either";

import { DecodeError } from "./internal/error.js";
import * as internal from "./internal/request.js";


/**
 * @since 0.0.1
 * @category model
 */
export { HttpRequest } from "./internal/request.js";

/**
 * @since 0.0.1
 * @category decoder
 */
export const json: (value: Request) => Promise<Either<DecodeError, any>> =
  internal.json;

/**
 * @since 0.0.1
 * @category decoder
 */
export const text: (value: Request) => Promise<Either<DecodeError, string>> =
  internal.text;

/**
 * @since 0.0.1
 * @category decoder
 */
export const blob: (value: Request) => Promise<Either<DecodeError, Blob>> =
  internal.blob;

/**
 * @since 0.0.1
 * @category decoder
 */
export const formData: (
  value: Request
) => Promise<Either<DecodeError, FormData>> = internal.formData;

/**
 * @since 0.0.1
 * @category decoder
 */
export const arrayBuffer: (
  value: Request
) => Promise<Either<DecodeError, ArrayBuffer>> = internal.arrayBuffer;
