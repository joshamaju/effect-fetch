/**
 * @since 0.0.1
 */

import { Either } from "fp-ts/Either";

import { Chain } from "../Interceptor.js";
import { HttpRequest } from "../Request.js";
import { HttpError } from "../Error.js";

export class TimeoutError {
  readonly _tag = "TimeoutError";
}

const Timeout = (duration: number) => {
  return async (
    chain: Chain
  ): Promise<Either<HttpError | TimeoutError, Response>> => {
    const { init, url } = chain.request;

    const parent = init?.signal;

    const controller = new AbortController();
    const signal = controller.signal;

    if (parent) parent.addEventListener("abort", controller.abort);

    const timeout = setTimeout(
      () => controller.abort(new TimeoutError()),
      duration
    );

    const res = await chain.proceed(new HttpRequest(url, { ...init, signal }));
    clearTimeout(timeout);
    return res;
  };
};

/**
 * @since 0.0.1
 * @category interceptor
 */
export default Timeout;
