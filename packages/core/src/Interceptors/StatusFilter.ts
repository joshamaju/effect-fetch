/**
 * @since 0.0.1
 */
import { chainW } from "fp-ts/Either";

import { filterStatus, filterStatusOk } from "../Response.js";
import { Chain } from "../Interceptor.js";

/**
 * @since 0.0.1
 * @category interceptor
 */
export const StatusOK = async function (chain: Chain) {
  const response = await chain.proceed(chain.request);
  return chainW(filterStatusOk)(response);
};

/**
 * @since 0.0.1
 * @category interceptor
 */
export const Status = (fn: (status: number) => boolean) => {
  return async function (chain: Chain) {
    const response = await chain.proceed(chain.request);
    return chainW((r: Response) => filterStatus(r, fn))(response);
  };
};
