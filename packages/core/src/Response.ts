/**
 * @since 0.0.1
 */
import { Either } from "fp-ts/Either";

import { dual } from "./internal/utils.js";
import { DecodeError } from "./internal/error.js";
import * as internal from "./internal/response/index.js";
import {
  ResponseT,
  StatusError,
  StatusErrorT
} from "./internal/response/index.js";
import { StatusNotOK, StatusOK } from "./internal/response/types.js";

export {
  /**
   * @since 0.0.1
   * @category status code
   */
  StatusCode,
  /**
   * @since 0.0.1
   * @category status code
   */
  StatusNotOK,
  /**
   * @since 0.0.1
   * @category status code
   */
  StatusOK
} from "./internal/response/types.js";

export {
  /**
   * @since 0.0.1
   * @category model
   */
  StatusError,

  /**
   * @since 0.0.1
   * @category model
   */
  StatusErrorT
} from "./internal/response/index.js";

export {
  /**
   * @since 0.0.1
   * @category model
   */
  HttpResponse
} from "./internal/response/index.js";

/**
 * @since 0.0.1
 * @category decoder
 */
export const json: (value: Response) => Promise<Either<DecodeError, any>> =
  internal.json;

/**
 * @since 0.0.1
 * @category decoder
 */
export const text: (value: Response) => Promise<Either<DecodeError, string>> =
  internal.text;

/**
 * @since 0.0.1
 * @category decoder
 */
export const blob: (value: Response) => Promise<Either<DecodeError, Blob>> =
  internal.blob;

/**
 * @since 0.0.1
 * @category decoder
 */
export const formData: (
  value: Response
) => Promise<Either<DecodeError, FormData>> = internal.formData;

/**
 * @since 0.0.1
 * @category decoder
 */
export const arrayBuffer: (
  value: Response
) => Promise<Either<DecodeError, ArrayBuffer>> = internal.arrayBuffer;

/**
 * @since 0.0.1
 * @category filtering
 */
export const filterStatusOk: (
  response: Response
) => Either<StatusError, Response> = internal.filterStatusOk;

/**
 * @since 0.0.1
 * @category filtering
 */
export const filterStatusOkT: (
  response: Response
) => Either<StatusErrorT<StatusNotOK>, ResponseT<StatusOK>> =
  internal.filterStatusOkT;

/**
 * @since 0.0.1
 * @category filtering
 */
export const filterStatus = dual<
  (
    fn: (status: number) => boolean
  ) => (response: Response) => Either<StatusError, Response>,
  (
    response: Response,
    fn: (status: number) => boolean
  ) => Either<StatusError, Response>
>(2, (r, f) => internal.filterStatus(r, f));
