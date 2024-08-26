/**
 * @since 0.0.1
 */
import { Either } from "fp-ts/Either";

import * as internal from "./internal/function.js";

/**
 * @since 0.0.1
 * @category combinator
 */
export const chain: <E, A, E1, B>(
  response: Either<E, A>,
  fn: (res: A) => Promise<Either<E1, B>>
) => Promise<Either<E | E1, B>> = internal.chain;
