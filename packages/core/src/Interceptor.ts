/**
 * @since 0.0.1
 */

import { Either } from "fp-ts/Either";
import { Reader } from "fp-ts/Reader";

import { dual } from "./internal/utils.js";
import { HttpError } from "./Error.js";
import { Fetch } from "./Fetch.js";
import * as internal from "./internal/interceptor.js";
import { HttpRequest } from "./internal/request.js";
import { InterceptorError } from "./internal/interceptor.js";

export {
  /**
   * @since 0.0.1
   * @category model
   */
  InterceptorError
} from "./internal/interceptor.js";

/** @internal */
export type Merge<
  I extends Interceptors<any, any>,
  T extends Interceptor<any, any>,
> =
  I extends Interceptors<infer R1, infer E1>
    ? T extends Interceptor<infer R2, infer E2>
      ? Interceptors<R1 | R2, E1 | E2>
      : never
    : never;

type NextFunction = (
  request: HttpRequest
) => Promise<Either<HttpError | InterceptorError, Response>>;

/**
 * @since 0.0.1
 * @category model
 */
export interface Chain {
  request: HttpRequest;
  proceed: NextFunction;
}

/**
 * @since 0.0.1
 * @category model
 */
export interface Interceptor<E, R>
  extends Reader<R | Chain, Promise<Either<E, Response>>> {}

/**
 * @since 0.0.1
 * @category model
 */
export type Interceptors<E, R> = Array<Interceptor<E, R>>;

/**
 * @since 0.0.1
 * @category constructor
 */
export const of: <E, R>(interceptor: Interceptor<E, R>) => Interceptors<E, R> =
  internal.of;

/**
 * @since 0.0.1
 * @category constructor
 */
export const empty: () => Interceptors<never, never> = internal.empty;

/**
 * @since 0.0.1
 * @category combinator
 */
export const add: {
  <T extends Interceptor<any, any>>(
    interceptor: T
  ): <E, R>(interceptors: Interceptors<E, R>) => Merge<Interceptors<E, R>, T>;
  <T extends Interceptor<any, any>, E, R>(
    interceptors: Interceptors<E, R>,
    interceptor: T
  ): Merge<Interceptors<E, R>, T>;
} = dual(
  2,
  <T extends Interceptor<any, any>, E, R>(
    interceptors: Interceptors<E, R>,
    interceptor: T
  ) => internal.add(interceptors, interceptor)
);

/**
 * @since 0.0.1
 * @category constructor
 */
export const copy: <E, R>(
  interceptors: Interceptors<E, R>
) => Interceptors<E, R> = internal.copy;

/**
 * @since 0.0.1
 * @category constructor
 */
export const make: <E, R>(
  interceptors: Interceptors<E, R>
) => (fetch: Fetch<HttpError>) => Fetch<E | HttpError> =
  internal.make;
