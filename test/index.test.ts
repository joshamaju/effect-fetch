import { describe, expect, test } from "vitest";

import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import * as Layer from "effect/Layer";

import * as Adapter from "../src/Adapters/Fetch.js";
import * as Fetch from "../src/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import * as Request from "../src/Request.js";
import * as Response from "../src/Response.js";
import { DecodeError } from "../src/internal/error.js";

import * as BaseUrl from "../src/Interceptors/Url.js";

import * as Client from "../src/Client.js";

const adapter = Fetch.make(Adapter.fetch);

const base_url = "https://reqres.in/api";

const base_url_interceptor = Effect.flatMap(Interceptor.Context, (_) => {
  const request = _.request.clone();
  const url = request.url.toString();
  const newUrl = base_url.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
  return _.proceed(Request.make(newUrl, request.init));
});

const pass_through = Effect.flatMap(Interceptor.Context, (_) =>
  _.proceed(_.request)
);

class Err {
  readonly _tag = "Err";
}

const error_interceptor = Effect.fail(new Err());

const makeClient = <A, E, R>(effect: Effect.Effect<A, E, R | Fetch.Fetch>) => {
  const interceptors = Interceptor.empty().pipe(
    Interceptor.add(base_url_interceptor)
  );

  const interceptor = Interceptor.provide(
    Interceptor.make(interceptors),
    Adapter.fetch
  );

  return Effect.provide(effect, Fetch.effect(interceptor));
};

test("google", async () => {
  const result = await pipe(
    Fetch.fetch("https://www.google.com"),
    Effect.flatMap(Response.text),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result).toContain("Google");
});

test("streaming", async () => {
  const result = await pipe(
    Fetch.fetch("https://www.google.com"),
    Effect.map((_) =>
      _.body == null
        ? Stream.fail(new DecodeError("Cannot create stream from empty body"))
        : Stream.fromReadableStream(
            () => _.body!,
            (r) => new DecodeError(r)
          )
    ),
    Stream.unwrap,
    Stream.runFold("", (a, b) => a + new TextDecoder().decode(b)),
    Effect.provide(adapter),
    Effect.runPromise
  );

  expect(result).toContain("Google");
});

test("with client factory", async () => {
  const program = Effect.flatMap(Fetch.fetch("/users/2"), Response.json);
  const result = await Effect.runPromise(makeClient(program));
  expect(result.data.id).toBe(2);
});

test("fetch with Effect.gen", async () => {
  const newAdapter = pipe(
    Interceptor.make(Interceptor.of(base_url_interceptor)),
    Effect.provide(adapter),
    Fetch.effect
  );

  const program = Effect.gen(function*() {
    const fetch = yield* Fetch.Fetch;
    const res = yield* fetch("/users/2")
    return yield* Response.json(res)
  })

  const result = await program.pipe(
    Effect.provide(newAdapter),
    Effect.runPromise
  );

  expect(result.data.id).toBe(2);
});

describe("Interceptors", () => {
  test("single", async () => {
    const newAdapter = pipe(
      Interceptor.make(Interceptor.of(base_url_interceptor)),
      Effect.provide(adapter),
      Fetch.effect
    );

    const result = await pipe(
      Fetch.fetch("/users/2"),
      Effect.flatMap(Response.json),
      Effect.provide(newAdapter),
      Effect.runPromise
    );

    expect(result.data.id).toBe(2);
  });

  test("error", async () => {
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

  test("should intercept and change response", async () => {
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
  });

  test("should copy interceptors", async () => {
    const explode = Effect.fail({ explosive: "boom" });

    const interceptors = Interceptor.add(
      Interceptor.empty(),
      base_url_interceptor
    );

    const clone = pipe(
      Interceptor.copy(interceptors),
      Interceptor.add(explode),
      Interceptor.make
    );

    const adapter = Fetch.effect(Interceptor.provide(clone, Adapter.fetch));

    const result = await pipe(
      Fetch.fetch("/users/2"),
      Effect.provide(adapter),
      Effect.either,
      Effect.runPromise
    );

    expect(result).toEqual(Either.left({ explosive: "boom" }));
  });

  describe("Base URL", () => {
    test("should attach url to every outgoing request", async () => {
      const interceptors = Interceptor.of(BaseUrl.Url(base_url));

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

    test("async: should attach url to every outgoing request", async () => {
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
  });
});

describe("Client", () => {
  test("can access individual client services", async () => {
    const interceptors = Interceptor.of(base_url_interceptor);

    const adapter = pipe(
      Interceptor.make(interceptors),
      Interceptor.provide(Adapter.fetch),
      Fetch.effect
    );

    const result = await pipe(
      Client.get("/users/2"),
      Effect.flatMap(Response.json),
      Effect.provide(adapter),
      Effect.runPromise
    );

    expect(result.data.id).toBe(2);
  });

  test("should construct client with base URL", async () => {
    const program = Effect.gen(function* () {
      const client = yield* Client.Client;
      return yield* Effect.flatMap(client.get("/users/2"), Response.json);
    });

    const client = Client.create({ url: base_url, adapter: Adapter.fetch });
    const layer = Layer.effect(Client.Client, client);

    const result = await program.pipe(Effect.provide(layer), Effect.runPromise);

    expect(result.data.id).toBe(2);
  });

  test("should construct client with interceptors", async () => {
    const program = Effect.gen(function* () {
      const client = yield* Client.Client;
      return yield* Effect.flatMap(client.get("/users/2"), Response.json);
    });

    const interceptors = Interceptor.of(base_url_interceptor);
    const client = Client.create({ interceptors, adapter: Adapter.fetch });
    const layer = Layer.effect(Client.Client, client);

    const result = await program.pipe(Effect.provide(layer), Effect.runPromise);

    expect(result.data.id).toBe(2);
  });
});
