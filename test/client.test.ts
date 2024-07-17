import { expect, test } from "vitest";

import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";

import * as Adapter from "../src/Adapters/Fetch.js";
import * as Fetch from "../src/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import * as Response from "../src/Response.js";
import * as BaseUrl from "../src/Interceptors/Url.js";
import * as Http from "../src/Client.js";
import { json } from "../src/internal/body.js";

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseUrl.Url(base_url);

test("should make client with http method methods", async () => {
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
  const layer = Layer.effect(Http.Client, client);

  const result = await Effect.runPromise(Effect.provide(program, layer));

  expect(result.data.id).toBe(2);
});

test("should make client with interceptors", async () => {
  const program = Effect.gen(function* () {
    const client = yield* Http.Client;
    return yield* Effect.flatMap(client.get("/users/2"), Response.json);
  });

  const interceptors = Interceptor.of(base_url_interceptor);
  const client = Http.create({ interceptors, adapter: Adapter.fetch });
  const layer = Layer.effect(Http.Client, client);

  const result = await program.pipe(Effect.provide(layer), Effect.runPromise);

  expect(result.data.id).toBe(2);
});

test("should attach JSON body and headers", async () => {
  const spy = Effect.flatMap(Interceptor.Chain, (chain) => {
    const headers = new Headers(chain.request.init?.headers);

    expect(typeof chain.request.init?.body).toBe("string");
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
