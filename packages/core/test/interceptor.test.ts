import { describe, expect, test } from "vitest";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";

import PlatformAdapter from "../src/Adapters/Fetch.js";
import { HttpError } from "../src/Error.js";
import * as Interceptor from "../src/Interceptor.js";
import * as Http from "../src/index.js";
import * as Result from "../src/Response.js";
import { InterceptorError } from "../src/Interceptor.js";

import Timeout, { TimeoutError } from "../src/Interceptors/Timeout.js";
import BaseURL from "../src/Interceptors/Url.js";

const adapter = PlatformAdapter;

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseURL(base_url);

class Err {
  readonly _tag = "Err";
}

const error_interceptor = () => Promise.resolve(E.left(new Err()));

test("should call interceptors in provided order", async () => {
  let order: number[] = [];

  const first = async function (chain: Interceptor.Chain) {
    order.push(1);
    const res = await chain.proceed(chain.request);
    order.push(1);
    return res;
  };

  const second = async function (chain: Interceptor.Chain) {
    order.push(2);
    const res = await chain.proceed(chain.request);
    order.push(2);
    return res;
  };

  const third = async function (chain: Interceptor.Chain) {
    order.push(3);
    const res = await chain.proceed(chain.request);
    order.push(3);
    return res;
  };

  const interceptors_asc = pipe(
    Interceptor.empty(),
    Interceptor.add(first),
    Interceptor.add(second),
    Interceptor.add(third),
    Interceptor.add(error_interceptor)
  );

  let interceptor = Interceptor.make(interceptors_asc)(PlatformAdapter);

  const program = Http.fetch(base_url + "/users/2");

  await program(interceptor);

  expect(order).toStrictEqual([1, 2, 3, 3, 2, 1]);

  order = [];

  const interceptors_desc = pipe(
    Interceptor.empty(),
    Interceptor.add(third),
    Interceptor.add(second),
    Interceptor.add(first)
  );

  const interceptor_desc = Interceptor.make(interceptors_desc)(PlatformAdapter);

  await Http.fetch(base_url + "/users/2")(interceptor_desc);

  expect(order).toStrictEqual([3, 2, 1, 1, 2, 3]);
});

test("every interceptor should receive the result of the next interceptor", async () => {
  const first = async function (chain: Interceptor.Chain) {
    const res = await chain.proceed(chain.request);
    const text = await Http.chain(res, Result.text);
    return E.map((t: string) => new Response((parseFloat(t) + 2).toString()))(
      text
    );
  };

  const second = async function (chain: Interceptor.Chain) {
    const res = await chain.proceed(chain.request);
    const text = await Http.chain(res, Result.text);
    return E.map((t: string) => new Response((parseFloat(t) + 1).toString()))(
      text
    );
  };

  const third = async () => E.right(new Response("1"));

  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(first),
    Interceptor.add(second),
    Interceptor.add(third)
  );

  const interceptor = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.fetch(base_url + "/users/2")(interceptor);

  const result = await Http.chain(res, (_) => _.text());

  expect((result as E.Right<any>).right).toBe("4");
});

test("should return early without calling the next interceptor", async () => {
  let variable = 1;

  const early = async () => E.right(new Response("10"));

  const mutate = function (chain: Interceptor.Chain) {
    variable = 2;
    return chain.proceed(chain.request);
  };

  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(early),
    Interceptor.add(mutate)
  );

  const interceptor = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.fetch(base_url + "/users/2")(interceptor);

  const result = await Http.chain(res, (_) => _.text());

  expect((result as E.Right<any>).right).toBe("10");
  expect(variable).toBe(1);
});

test("should create handler with single interceptor", async () => {
  const interceptors = Interceptor.of(base_url_interceptor);
  const fetchWithInterceptor = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.fetch("/users/2")(fetchWithInterceptor);

  const result = await Http.chain(res, (_) => _.json());

  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("should create handler with early error interceptor", async () => {
  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(base_url_interceptor),
    Interceptor.add(error_interceptor)
  );

  const newAdapter = Interceptor.make(interceptors)(adapter);

  const res = await Http.fetch("/users/2")(newAdapter);

  const result = await Http.chain(res, (_) => _.json());

  expect(E.isLeft(result)).toBeTruthy();

  expect((result as Extract<typeof result, { _tag: "Left" }>).left).toEqual({
    _tag: "Err",
  });
});

test("should create handler with early success response", async () => {
  const evil_interceptor = async () =>
    E.right(new Response(JSON.stringify({ data: { id: "😈 evil" } })));

  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(base_url_interceptor),
    Interceptor.add(evil_interceptor)
  );

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.fetch("/users/2")(adapter);

  const result = await Http.chain(res, (_) => _.json());

  expect((result as E.Right<any>).right.data.id).not.toBe(2);
  expect((result as E.Right<any>).right.data.id).toBe("😈 evil");
});

test("should copy/inherit interceptors", async () => {
  const explode = async () => E.left({ explosive: "boom" });

  const interceptors = Interceptor.add(
    Interceptor.empty(),
    base_url_interceptor
  );

  const clone = Interceptor.add(Interceptor.copy(interceptors), explode);

  const adapter = Interceptor.make(clone)(PlatformAdapter);

  const result = await Http.fetch("/users/2")(adapter);

  expect(clone.length).not.toEqual(interceptors.length);
  expect(result).toEqual(E.left({ explosive: "boom" }));
});

test("should attach url to every outgoing request", async () => {
  const spy = async function (chain: Interceptor.Chain) {
    expect(chain.request.url).toBe("/users/2");
    const res = await chain.proceed(chain.request);
    return E.map((res: Response) => {
      expect(res.url).toBe("https://reqres.in/api/users/2");
      return res;
    })(res);
  };

  const interceptors = pipe(
    Interceptor.of(spy),
    Interceptor.add(base_url_interceptor)
  );

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  await Http.fetch("/users/2")(adapter);
});

test("should make interceptor from effect", async () => {
  const adapter = function () {
    const interceptors = Interceptor.of(BaseURL(base_url));
    return Interceptor.make(interceptors)(PlatformAdapter);
  };

  const res = await Http.fetch("/users/2")(adapter());

  const result = await Http.chain(res, (_) => _.json());

  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("should make interceptor from effect with additional requirements", async () => {
  type Store = { get: T.Task<string> };

  const url = async function (store: Store) {
    const url = await store.get();
    return BaseURL(url);
  };

  const interceptors = Interceptor.of(await url({ get: T.of(base_url) }));

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  let res = await Http.fetch("/users/2")(adapter);

  const result = await Http.chain(res, (_) => _.json());

  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("request timeout interceptor", async () => {
  const clock = async function (chain: Interceptor.Chain) {
    const res = chain.proceed(chain.request);
    // yield* TestClock.adjust(Duration.seconds(10));
    return await res;
  };

  const interceptors = pipe(
    Interceptor.of(base_url_interceptor),
    Interceptor.add(Timeout(5000)),
    Interceptor.add(clock)
    // Interceptor.add(error_interceptor)
  );

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  // const result = await program.pipe(
  //   Effect.provide(TestContext.TestContext),
  //   Effect.provide(Fetch.effect(adapter)),
  //   Effect.either,
  //   Effect.runPromise
  // );

  const result = await Http.fetch("/users/2?delay=10")(adapter);

  const err = (result as Extract<typeof result, { _tag: "Left" }>).left;

  expect(E.isLeft(result)).toBeTruthy();
  expect(err).instanceOf(HttpError);
  expect((err as Extract<typeof err, HttpError>).cause).instanceOf(
    TimeoutError
  );
});

describe("error handling", () => {
  test("should receive returned error by interceptor in the chain", async () => {
    const first = async function (chain: Interceptor.Chain) {
      const res = await chain.proceed(chain.request);

      expect(E.isLeft(res)).toBeTruthy();
      expect((res as any as E.Left<string>).left).toBe("error");

      return res;
    };

    const second = async () => E.left("error");

    const interceptors = pipe(
      Interceptor.empty(),
      Interceptor.add(first),
      Interceptor.add(second)
    );

    const interceptor = Interceptor.make(interceptors)(PlatformAdapter);

    await Http.fetch(base_url + "/users/2")(interceptor);
  });

  test("should catch error thrown by interceptor in the chain", async () => {
    let _res: E.Left<any> | undefined;

    const first = async function (chain: Interceptor.Chain) {
      const res = await chain.proceed(chain.request);
      _res = res as E.Left<any>;
      return res;
    };

    const second = async () => {
      throw new Error("error");
    };

    const interceptors = pipe(
      Interceptor.empty(),
      Interceptor.add(first),
      Interceptor.add(second)
    );

    const interceptor = Interceptor.make(interceptors)(PlatformAdapter);

    await Http.fetch(base_url + "/users/2")(interceptor);

    const err = _res!.left;

    expect(E.isLeft(_res!)).toBeTruthy();

    expect(err).instanceOf(HttpError);

    expect(err.cause).instanceOf(InterceptorError);

    const e = err.cause as InterceptorError;

    expect(e.name).toBe("second");
    expect(e.cause).toStrictEqual(new Error("error"));
  });
});
