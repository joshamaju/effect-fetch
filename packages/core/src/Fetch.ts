/**
 * @since 0.0.1
 */
import type { Either } from "fp-ts/Either";

import { HttpError } from "./internal/error.js";
import * as internal from "./internal/fetch.js";
import { HttpRequest } from "./internal/request.js";
import { HttpResponse } from "./internal/response/index.js";

/**
 * @since 0.0.1
 * @category model
 */
export interface Adapter {
  (
    url: string | URL | HttpRequest,
    init?: RequestInit
  ): Promise<Either<HttpError, Response>>;
}

/**
 * @since 0.0.1
 * @category model
 */
export type Fetch<E> = (
  ...args: Parameters<Adapter>
) => Promise<Either<E | HttpError, Response>>;

/**
 * @since 0.0.1
 * @category constructor
 */
export const fetch_: (
  url: string | URL,
  init?: RequestInit | undefined
) => <E>(fetch: Fetch<E>) => Promise<Either<E | HttpError, Response>> =
  internal.fetch;

/**
 * @since 0.0.1
 * @category constructor
 */
export const fetch: (
  url: string | URL,
  init?: RequestInit | undefined
) => <E>(fetch: Fetch<E>) => Promise<Either<E | HttpError, HttpResponse>> =
  internal.fetch_;