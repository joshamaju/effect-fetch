/**
 * @since 2.1.0
 */

import { DurationInput } from "effect/Duration";
import * as Effect from "effect/Effect";

import { Chain } from "../Interceptor.js";

/**
 * @since 2.1.0
 * @category interceptor
 */
export const Timeout = (duration: DurationInput) => {
  return Effect.flatMap(Chain, (chain) => {
    return Effect.timeout(chain.proceed(chain.request), duration);
  });
};
