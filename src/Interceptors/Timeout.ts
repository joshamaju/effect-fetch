/**
 * @since 2.1.0
 */

import { Duration } from "effect/Duration";
import * as Effect from "effect/Effect";

import { Chain } from "../Interceptor.js";

/**
 * @since 2.1.0
 * @category interceptor
 */
export const Timeout = (duration: Duration) => {
  return Effect.flatMap(Chain, (chain) => {
    return Effect.timeout(chain.proceed(chain.request), duration);
  });
};
