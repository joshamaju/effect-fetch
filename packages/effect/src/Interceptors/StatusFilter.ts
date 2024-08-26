/**
 * @since 2.1.0
 */

import * as Effect from "effect/Effect";
import { Predicate } from "effect/Predicate";

import { Chain } from "../Interceptor.js";
import { filterStatusOk, filterStatus } from "../Response.js";

/**
 * @since 2.1.0
 * @category interceptor
 */
export const StatusOK = Effect.gen(function* () {
  const chain = yield* Chain;
  const response = yield* chain.proceed(chain.request);
  return yield* filterStatusOk(response);
});

/**
 * @since 2.1.0
 * @category interceptor
 */
export const Status = (fn: Predicate<number>) => {
  return Effect.gen(function* () {
    const chain = yield* Chain;
    const response = yield* chain.proceed(chain.request);
    return yield* filterStatus(response, fn);
  });
};
