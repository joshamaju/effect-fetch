import { expect, test } from "vitest";

import { TimeoutException } from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Fiber from "effect/Fiber";
import { pipe } from "effect/Function";
import * as TestClock from "effect/TestClock";
import * as TestContext from "effect/TestContext";

import * as Adapter from "../src/Adapters/Fetch.js";
import * as Fetch from "../src/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import * as Response from "../src/Response.js";

import { Timeout } from "../src/Interceptors/Timeout.js";
import * as BaseUrl from "../src/Interceptors/Url.js";

const adapter = Fetch.make(Adapter.fetch);

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseUrl.Url(base_url);

class Err {
  readonly _tag = "Err";
}

const error_interceptor = Effect.fail(new Err());

test("should call interceptors in provided order", async () => {
  let order: number[] = [];

  const first = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    order.push(1);
    const res = yield* chain.proceed(chain.request);
    order.push(1);
    return res;
  });

  const second = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    order.push(2);
    const res = yield* chain.proceed(chain.request);
    order.push(2);
    return res;
  });

  const third = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    order.push(3);
    const res = yield* chain.proceed(chain.request);
    order.push(3);
    return res;
  });

  const interceptors_asc = Interceptor.empty().pipe(
    Interceptor.add(first),
    Interceptor.add(second),
    Interceptor.add(third)
  );

  const interceptor_asc = pipe(
    Interceptor.make(interceptors_asc),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  await pipe(
    Fetch.fetch(base_url + "/users/2"),
    Effect.provide(interceptor_asc),
    Effect.runPromise
  );

  expect(order).toStrictEqual([1, 2, 3, 3, 2, 1]);

  order = [];

  const interceptors_desc = Interceptor.empty().pipe(
    Interceptor.add(third),
    Interceptor.add(second),
    Interceptor.add(first)
  );

  const interceptor_desc = pipe(
    Interceptor.make(interceptors_desc),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  await pipe(
    Fetch.fetch(base_url + "/users/2"),
    Effect.provide(interceptor_desc),
    Effect.runPromise
  );

  expect(order).toStrictEqual([3, 2, 1, 1, 2, 3]);
});

test("should create handler with single interceptor", async () => {
  const fetchWithInterceptor = pipe(
    Interceptor.make(Interceptor.of(base_url_interceptor)),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(fetchWithInterceptor),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

test("should create handler with early error interceptor", async () => {
  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(base_url_interceptor),
    Interceptor.add(error_interceptor)
  );

  const newAdapter = pipe(
    Interceptor.make(interceptors),
    Effect.provide(adapter),
    Fetch.effect
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(newAdapter),
    Effect.either,
    Effect.runPromise
  );

  expect(Either.isLeft(result)).toBeTruthy();
  expect((result as Either.Left<Err, any>).left).toEqual({ _tag: "Err" });
});

test("should create handler with early success response", async () => {
  const evil_interceptor = Effect.succeed(
    new globalThis.Response(JSON.stringify({ data: { id: "😈 evil" } }))
  );

  const interceptors = pipe(
    Interceptor.empty(),
    Interceptor.add(base_url_interceptor),
    Interceptor.add(evil_interceptor)
  );

  const adapter = pipe(
    Interceptor.make(interceptors),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result.data.id).not.toBe(2);
  expect(result.data.id).toBe("😈 evil");
});

test("should copy/inherit interceptors", async () => {
  const explode = Effect.fail({ explosive: "boom" });

  const interceptors = Interceptor.add(
    Interceptor.empty(),
    base_url_interceptor
  );

  const clone = Interceptor.add(Interceptor.copy(interceptors), explode);

  const adapter = Fetch.effect(
    Interceptor.provide(Interceptor.make(clone), Adapter.fetch)
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.provide(adapter),
    Effect.either,
    Effect.runPromise
  );

  expect(Chunk.size(clone)).not.toEqual(Chunk.size(interceptors));
  expect(result).toEqual(Either.left({ explosive: "boom" }));
});

test("should attach url to every outgoing request", async () => {
  const spy = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    expect(chain.request.url).toBe("/users/2");
    const res = yield* chain.proceed(chain.request);
    expect(res.url).toBe("https://reqres.in/api/users/2");
    return res;
  });

  const interceptors = Interceptor.of(spy).pipe(
    Interceptor.add(base_url_interceptor)
  );

  const adapter = Interceptor.provide(
    Interceptor.make(interceptors),
    Adapter.fetch
  );

  await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(Fetch.effect(adapter)),
    Effect.runPromise
  );
});

test("should make interceptor from effect", async () => {
  const adapter = Fetch.effect(
    Effect.gen(function* () {
      const interceptors = Interceptor.of(BaseUrl.Url(base_url));
      return yield* Interceptor.provide(
        Interceptor.make(interceptors),
        Adapter.fetch
      );
    })
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

test("should make interceptor from effect with additional requirements", async () => {
  const Store = Context.GenericTag<{ get: Effect.Effect<string> }>(
    "interceptor-test"
  );

  const interceptor = Effect.gen(function* () {
    const url = yield* (yield* Store).get;
    return yield* BaseUrl.Url(url);
  });

  const adapter = Fetch.effect(
    Interceptor.provide(
      Interceptor.make(Interceptor.of(interceptor)),
      Adapter.fetch
    )
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.provideService(Store, { get: Effect.succeed(base_url) }),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

test("request timeout interceptor", async () => {
  const program = Effect.flatMap(
    Fetch.fetch("/users/2?delay=10"),
    Response.json
  );

  const clock = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    const res = yield* Effect.fork(chain.proceed(chain.request));
    yield* TestClock.adjust(Duration.seconds(10));
    return yield* Fiber.join(res);
  });

  const interceptors = Interceptor.of(base_url_interceptor).pipe(
    Interceptor.add(Timeout(Duration.seconds(5))),
    Interceptor.add(clock)
  );

  const adapter = Interceptor.make(interceptors).pipe(
    Interceptor.provide(Adapter.fetch)
  );

  const result = await program.pipe(
    Effect.provide(TestContext.TestContext),
    Effect.provide(Fetch.effect(adapter)),
    Effect.either,
    Effect.runPromise
  );

  expect(Either.isLeft(result)).toBeTruthy();
  expect((result as Either.Left<any, any>).left).instanceOf(TimeoutException);
});
