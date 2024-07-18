import { expect, test } from "vitest";

import * as Chunk from "effect/Chunk";
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

import { TimeoutException } from "effect/Cause";
import { Timeout } from "../src/Interceptors/Timeout.js";
import * as BaseUrl from "../src/Interceptors/Url.js";

const adapter = Fetch.make(Adapter.fetch);

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseUrl.Url(base_url);

class Err {
  readonly _tag = "Err";
}

const error_interceptor = Effect.fail(new Err());

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
  const interceptors = Interceptor.of(base_url_interceptor);

  const adapter = Interceptor.make(interceptors).pipe(
    Interceptor.provide(Adapter.fetch)
  );

  const result = await pipe(
    Fetch.fetch("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(Fetch.effect(adapter)),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
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
