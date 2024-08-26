/**
 * @since 0.0.1
 */
import { left, right } from "fp-ts/Either";

import { Adapter } from "../Fetch.js";
import { HttpError } from "../internal/error.js";
import { HttpRequest } from "../internal/request.js";

const fetch_: Adapter = async (url, init) => {
  try {
    const res = await (url instanceof HttpRequest
      ? fetch(url.url, url.init)
      : fetch(url, init));

    return right(res);
  } catch (error) {
    return left(new HttpError(error));
  }
};

/**
 * @since 0.0.1
 * @category adapter
 */
export default fetch_
