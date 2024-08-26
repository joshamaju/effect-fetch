import * as E from "fp-ts/Either";

import { DecodeError } from "./error.js";

export const decode = <T, R extends Request | Response>(
  fn: (request: R) => Promise<T>
) => {
  return async (value: R): Promise<E.Either<DecodeError, Awaited<T>>> => {
    try {
      const result = await fn(value);
      return E.right(result);
    } catch (error) {
      return E.left(new DecodeError(error));
    }
  };
};

/**
 * copied from
 * https://github.com/Effect-TS/effect/blob/46a575f48a05457b782fb21f7827d338c9b59320/packages/effect/src/Function.ts#L30
 * 
 * Creates a function that can be used in a data-last (aka `pipe`able) or
 * data-first style.
 *
 * The first parameter to `dual` is either the arity of the uncurried function
 * or a predicate that determines if the function is being used in a data-first
 * or data-last style.
 *
 * Using the arity is the most common use case, but there are some cases where
 * you may want to use a predicate. For example, if you have a function that
 * takes an optional argument, you can use a predicate to determine if the
 * function is being used in a data-first or data-last style.
 *
 * @param arity - Either the arity of the uncurried function or a predicate
 *                which determines if the function is being used in a data-first
 *                or data-last style.
 * @param body - The definition of the uncurried function.
 *
 * @example
 * import { dual, pipe } from "effect/Function"
 *
 * // Exampe using arity to determine data-first or data-last style
 * const sum: {
 *   (that: number): (self: number) => number
 *   (self: number, that: number): number
 * } = dual(2, (self: number, that: number): number => self + that)
 *
 * assert.deepStrictEqual(sum(2, 3), 5)
 * assert.deepStrictEqual(pipe(2, sum(3)), 5)
 *
 * // Example using a predicate to determine data-first or data-last style
 * const sum2: {
 *   (that: number): (self: number) => number
 *   (self: number, that: number): number
 * } = dual((args) => args.length === 1, (self: number, that: number): number => self + that)
 *
 * assert.deepStrictEqual(sum(2, 3), 5)
 * assert.deepStrictEqual(pipe(2, sum(3)), 5)
 *
 * @since 2.0.0
 */
export const dual: {
  <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(
    arity: Parameters<DataFirst>["length"],
    body: DataFirst
  ): DataLast & DataFirst
  <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(
    isDataFirst: (args: IArguments) => boolean,
    body: DataFirst
  ): DataLast & DataFirst
} = function(arity, body) {
  if (typeof arity === "function") {
    return function() {
      if (arity(arguments)) {
        // @ts-expect-error
        return body.apply(this, arguments)
      }
      return ((self: any) => body(self, ...arguments)) as any
    }
  }

  switch (arity) {
    case 0:
    case 1:
      throw new RangeError(`Invalid arity ${arity}`)

    case 2:
      return function(a, b) {
        if (arguments.length >= 2) {
          return body(a, b)
        }
        return function(self: any) {
          return body(self, a)
        }
      }

    case 3:
      return function(a, b, c) {
        if (arguments.length >= 3) {
          return body(a, b, c)
        }
        return function(self: any) {
          return body(self, a, b)
        }
      }

    case 4:
      return function(a, b, c, d) {
        if (arguments.length >= 4) {
          return body(a, b, c, d)
        }
        return function(self: any) {
          return body(self, a, b, c)
        }
      }

    case 5:
      return function(a, b, c, d, e) {
        if (arguments.length >= 5) {
          return body(a, b, c, d, e)
        }
        return function(self: any) {
          return body(self, a, b, c, d)
        }
      }

    default:
      return function() {
        if (arguments.length >= arity) {
          // @ts-expect-error
          return body.apply(this, arguments)
        }
        const args = arguments
        return function(self: any) {
          return body(self, ...args)
        }
      }
  }
}