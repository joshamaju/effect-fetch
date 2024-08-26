/**
 * @since 1.0.0
 */

import * as Effect from "effect/Effect";
import { Adapter } from "../Fetch.js";
import { HttpError } from "../internal/error.js";
import { HttpRequest } from "../internal/request.js";

const fetch_: Adapter = (url, init) => {
  return Effect.tryPromise({
    catch: (error) => new HttpError(error),
    try: (signal) => {
      return url instanceof HttpRequest
        ? fetch(url.request, { signal })
        : fetch(url, { signal, ...init });
    },
  });
};

export {
  /**
   * @since 1.0.0
   * @category adapter
   */
  fetch_ as fetch,
};
