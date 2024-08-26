/**
 * @since 0.0.1
 */

import { Chain } from "../Interceptor.js";
import { HttpRequest } from "../Request.js";

const Url = (base: string) => {
  return function (context: Chain) {
    const req = context.request;
    const url = req.url.toString();

    let url_ = url
      ? base.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "")
      : base;

    return context.proceed(new HttpRequest(url_, req.init));
  };
};

/**
 * @since 0.0.1
 * @category interceptor
 */
export default Url;
