import { Either, left } from "fp-ts/Either";
import { Reader } from "fp-ts/Reader";

import { Fetch } from "../Fetch.js";
import { Chain, Interceptor, Interceptors } from "../Interceptor.js";
import { HttpError } from "./error.js";
import { HttpRequest } from "./request.js";

export class InterceptorError {
  readonly _tag = "InterceptorError";
  constructor(
    public name: string,
    public index: number,
    public cause: unknown
  ) {}
}

export function compose(
  initiator: Reader<Chain, Promise<Either<any, Response>>>
) {
  return <E, R>(interceptors: Interceptors<E, R>) =>
    (request: HttpRequest) => {
      let index = -1;

      function dispatch(
        i: number,
        request: HttpRequest
      ): Promise<Either<E | HttpError, Response>> {
        if (i <= index) {
          throw new Error("proceed() called multiple times");
        }

        index = i;

        let handler = interceptors[i];

        if (!handler || i === interceptors.length) {
          handler = initiator as Interceptor<E, R>;
        }

        const chain: Chain = {
          request,
          // @ts-expect-error
          proceed: (req) => dispatch(i + 1, req),
        };

        return handler(chain).catch((e) =>
          left(new HttpError(new InterceptorError(handler.name, i, e)))
        );
      }

      return dispatch(0, request);
    };
}

export const make = <E, R>(interceptors: Interceptors<E, R>) => {
  return function (fetch: Fetch<HttpError>): Fetch<E> {
    return (...args) => {
      const fn = compose(({ request }) => fetch(request.url, request.init));
      return fn(interceptors)(new HttpRequest(...args));
    };
  };
};

export const of = <E, R>(
  interceptor: Interceptor<E, R>
): Interceptors<E, R> => [interceptor];

export const empty = (): Interceptors<never, never> => [];

export const add = <T extends Interceptor<any, any>, E, R>(
  interceptors: Interceptors<E, R>,
  interceptor: T
) => {
  return [...interceptors, interceptor];
};

export const copy = <E, R>(interceptors: Interceptors<E, R>) => {
  return [...interceptors];
};
