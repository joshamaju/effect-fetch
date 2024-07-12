/**
 * @since 1.3.0
 */

import * as Effect from "effect/Effect";

import * as Request from "../Request.js";
import {Context} from "../Interceptor.js";

/**
 * @since 1.3.0
 * @category interceptor
 */
export const Url = (base: string) => {
  return Effect.gen(function* () {
    const context = yield* Context;

    const req = context.request;
    const url = req.url.toString();

    let url_ = url
      ? base.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "")
      : base;

    return yield* context.proceed(Request.make(url_, req.init));
  });
};
