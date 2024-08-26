import * as Effect from "effect/Effect";
import { DecodeError } from "./error.js";

export const decode = <T, R extends Request | Response>(
  fn: (request: R) => Promise<T>
) => {
  return (value: R) =>
    Effect.tryPromise({
      try: () => fn(value),
      catch: (error) => new DecodeError(error),
    });
};