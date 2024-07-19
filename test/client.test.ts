import { describe, expect, test } from "vitest";

import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Fiber from "effect/Fiber";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as TestClock from "effect/TestClock";
import * as TestContext from "effect/TestContext";

import { TimeoutException } from "effect/Cause";
import * as Adapter from "../src/Adapters/Fetch.js";
import * as Http from "../src/Client.js";
import * as Fetch from "../src/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import * as BaseUrl from "../src/Interceptors/Url.js";
import { json } from "../src/internal/body.js";
import * as Response from "../src/Response.js";

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseUrl.Url(base_url);

test("should make client with http methods", async () => {
  const interceptors = Interceptor.of(base_url_interceptor);

  const adapter = pipe(
    Interceptor.make(interceptors),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  const result = await pipe(
    Http.get("/users/2"),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

test("should make client with base URL for every request", async () => {
  const program = Effect.gen(function* () {
    const client = yield* Http.Client;
    return yield* Effect.flatMap(client.get("/users/2"), Response.json);
  });

  const client = Http.create({ url: base_url, adapter: Adapter.fetch });

  const result = await Effect.runPromise(
    Effect.provide(program, Http.layer(client))
  );

  expect(result.data.id).toBe(2);
});

test("should make client with interceptors", async () => {
  const program = Effect.gen(function* () {
    const client = yield* Http.Client;
    return yield* Effect.flatMap(client.get("/users/2"), Response.json);
  });

  const interceptors = Interceptor.of(base_url_interceptor);
  const client = Http.create({ interceptors, adapter: Adapter.fetch });

  const result = await program.pipe(
    Effect.provide(Http.layer(client)),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

test("should attach JSON body and headers", async () => {
  const spy = Effect.flatMap(Interceptor.Chain, (chain) => {
    const headers = new Headers(chain.request.init?.headers);

    expect(chain.request.init?.body).toBe('{"name":"morpheus","job":"leader"}');
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Content-Length")).toBeTruthy();

    return chain.proceed(chain.request);
  });

  const interceptors = Interceptor.of(base_url_interceptor).pipe(
    Interceptor.add(spy)
  );

  const adapter = pipe(
    Interceptor.make(interceptors),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  const result = await pipe(
    Http.post("/users", json({ name: "morpheus", job: "leader" })),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result).toMatchObject({
    name: "morpheus",
    job: "leader",
  });
});

test("should attach JSON body and headers with custom headers", async () => {
  const spy = Effect.flatMap(Interceptor.Chain, (chain) => {
    const headers = new Headers(chain.request.init?.headers);
    expect(headers.get("X-API-Key")).toBe("Bearer <APIKEY>");
    return chain.proceed(chain.request);
  });

  const interceptors = Interceptor.of(base_url_interceptor).pipe(
    Interceptor.add(spy)
  );

  const adapter = pipe(
    Interceptor.make(interceptors),
    Interceptor.provide(Adapter.fetch),
    Fetch.effect
  );

  const result = await pipe(
    Http.post("/users", {
      headers: { "X-API-Key": "Bearer <APIKEY>" },
      body: json({ name: "morpheus", job: "leader" }),
    }),
    Effect.flatMap(Response.json),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result).toMatchObject({
    name: "morpheus",
    job: "leader",
  });
});

describe("timeout", () => {
  const program = Effect.gen(function* () {
    const client = yield* Http.Client;
    return yield* client.get("/users/2?delay=10");
  });

  const clock = Effect.gen(function* () {
    const chain = yield* Interceptor.Chain;
    const res = yield* Effect.fork(chain.proceed(chain.request));
    yield* TestClock.adjust(Duration.seconds(10));
    return yield* Fiber.join(res);
  });

  test("with number timeout", async () => {
    const client = Http.create({
      timeout: 100,
      url: base_url,
      adapter: Adapter.fetch,
      interceptors: Interceptor.of(clock),
    });

    const result = await program.pipe(
      Effect.provide(Http.layer(client)),
      Effect.provide(TestContext.TestContext),
      Effect.either,
      Effect.runPromise
    );

    expect(Either.isLeft(result)).toBeTruthy();
    expect((result as Either.Left<any, any>).left).instanceOf(TimeoutException);
  });

  test("with Duration timeout", async () => {
    const client = Http.create({
      url: base_url,
      adapter: Adapter.fetch,
      timeout: Duration.seconds(5),
      interceptors: Interceptor.of(clock),
    });

    const result = await program.pipe(
      Effect.provide(Http.layer(client)),
      Effect.provide(TestContext.TestContext),
      Effect.either,
      Effect.runPromise
    );

    expect(Either.isLeft(result)).toBeTruthy();
    expect((result as Either.Left<any, any>).left).instanceOf(TimeoutException);
  });
});

describe("method", () => {
  const check = (method: string) => {
    return Effect.flatMap(Interceptor.Chain, (chain) => {
      expect(chain.request.init?.method).toBe(method);
      return Effect.succeed(new globalThis.Response(""));
    });
  };

  test("POST", async () => {
    const interceptors = Interceptor.of(check("POST"));

    const interceptor = pipe(
      Interceptor.make(interceptors),
      Interceptor.provide(Adapter.fetch)
    );

    await Effect.runPromise(
      Effect.provide(Http.post("/users/2"), Fetch.effect(interceptor))
    );
  });

  test("HEAD", async () => {
    const interceptors = Interceptor.of(check("HEAD"));

    const interceptor = pipe(
      Interceptor.make(interceptors),
      Interceptor.provide(Adapter.fetch)
    );

    await Effect.runPromise(
      Effect.provide(Http.head("/users/2"), Fetch.effect(interceptor))
    );
  });
});
