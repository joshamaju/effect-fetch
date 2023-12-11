/**
 * @since 1.0.0
 */
import { Effect } from "effect/Effect";
import { dual } from "effect/Function";
import * as internal from "./internal/response/index.js";
import { DecodeError } from "./internal/error.js";
import { ResponseT, StatusError, StatusErrorT } from "./internal/response/index.js";
import { NotOkStatusCode, OkStatusCode } from "./internal/response/types.js";
import { Predicate } from "effect/Predicate";

/**
 * @since 1.0.0
 */
export {StatusCode, OkStatusCode, NotOkStatusCode} from './internal/response/types.js'

/**
 * @since 1.0.0
 */
export {StatusError} from './internal/response/index.js'

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

export const filterStatusOk: (
  response: Response
) => Effect<never, StatusError, Response> =
  internal.filterStatusOk;

export const filterStatusOkT: (
  response: Response
) => Effect<never, StatusErrorT<NotOkStatusCode>, ResponseT<OkStatusCode>> =
  internal.filterStatusOkT;

export const filterStatus = dual<
  (
    fn: Predicate<number>
  ) => (response: Response) => Effect<never, StatusError, Response>,
  (
    response: Response,
    fn: Predicate<number>
  ) => Effect<never, StatusError, Response>
>(2, (r, f) => internal.filterStatus(r, f));
