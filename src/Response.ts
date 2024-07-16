/**
 * @since 1.0.0
 */
import { Effect } from "effect/Effect";
import { dual } from "effect/Function";
import { Predicate } from "effect/Predicate";

import * as internal from "./internal/response/index.js";
import { DecodeError } from "./internal/error.js";
import {
  ResponseT,
  StatusError,
  StatusErrorT,
} from "./internal/response/index.js";
import { NotOkStatusCode, OkStatusCode } from "./internal/response/types.js";

export {
  /**
   * @since 1.1.0
   * @category status code
   */
  StatusCode,

  /**
   * @since 1.1.0
   * @category status code
   */
  OkStatusCode,

  /**
   * @since 1.1.0
   * @category status code
   */
  NotOkStatusCode,
} from "./internal/response/types.js";

export {
  /**
   * @since 1.1.0
   * @category error
   */
  StatusError,

  /**
   * @since 1.1.0
   * @category error
   */
  StatusErrorT,
} from "./internal/response/index.js";

/**
 * @since 1.0.0
 * @category combinators
 */
export const json: (value: Response) => Effect<any, DecodeError, never> =
  internal.json;

/**
 * @since 1.0.0
 * @category combinators
 */
export const text: (value: Response) => Effect<string, DecodeError, never> =
  internal.text;

/**
 * @since 1.0.0
 * @category combinators
 */
export const blob: (value: Response) => Effect<Blob, DecodeError, never> =
  internal.blob;

/**
 * @since 1.0.0
 * @category combinators
 */
export const formData: (
  value: Response
) => Effect<FormData, DecodeError, never> = internal.formData;

/**
 * @since 1.0.0
 * @category combinators
 */
export const arrayBuffer: (
  value: Response
) => Effect<ArrayBuffer, DecodeError, never> = internal.arrayBuffer;

/**
 * @since 1.0.0
 * @category filtering
 */
export const filterStatusOk: (
  response: Response
) => Effect<Response, StatusError, never> = internal.filterStatusOk;

/**
 * @since 1.0.0
 * @category filtering
 */
export const filterStatusOkT: (
  response: Response
) => Effect<ResponseT<OkStatusCode>, StatusErrorT<NotOkStatusCode>, never> =
  internal.filterStatusOkT;

/**
 * @since 1.0.0
 * @category filtering
 */
export const filterStatus = dual<
  (
    fn: Predicate<number>
  ) => (response: Response) => Effect<Response, StatusError, never>,
  (
    response: Response,
    fn: Predicate<number>
  ) => Effect<Response, StatusError, never>
>(2, (r, f) => internal.filterStatus(r, f));
