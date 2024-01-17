import { describe, expect, test } from "vitest";

import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import * as Duration from "effect/Duration";

import * as Fetch from "../src/Fetch.js";
import * as Request from "../src/Request.js";
import * as Response from "../src/Response.js";
import * as Adapter from "../src/Adapters/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import { DecodeError } from "../src/internal/error.js";

import * as BaseUrl from "../src/Interceptors/Url.js";

const adapter = Fetch.make(Adapter.fetch);

const base_url = "https://reqres.in/api";

const base_url_interceptor = Effect.flatMap(Interceptor.Context, (_) => {
  const request = _.request.clone();
  const url = request.url.toString();
  const newUrl = base_url.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
  return _.proceed(Request.make(newUrl, request.init));
});

class Err {
  readonly _tag = "Err";
}

const error_interceptor = Effect.fail(new Err());

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

describe("Interceptors", () => {
  test("single", async () => {
    const newAdapter = pipe(
      Interceptor.makeFetch(Interceptor.of(base_url_interceptor)),
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
      Interceptor.makeFetch(interceptors),
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

    const adapter = Fetch.effect(
      Interceptor.makeAdapter(Adapter.fetch, interceptors)
    );

    const result = await pipe(
      Fetch.fetch("/users/2"),
      Effect.flatMap(Response.json),
      Effect.provide(adapter),
      Effect.runPromise
    );

    expect(result.data.id).not.toBe(2);
  });

  describe("Base URL", () => {
    test("should attach url to every outgoing request", async () => {
      const interceptors = Interceptor.of(BaseUrl.Url(base_url));

      const adapter = Fetch.effect(
        Interceptor.makeAdapter(Adapter.fetch, interceptors)
      );

      const result = await pipe(
        Fetch.fetch("/users/2"),
        Effect.flatMap(Response.json),
        Effect.provide(adapter),
        Effect.runPromise
      );

      expect(result.data.id).toBe(2);
    });

    test("async: should attach url to every outgoing request", async () => {
      const adapter = Fetch.effect(
        Effect.gen(function* (_) {
          const baseUrl = yield* _(Effect.succeed(base_url));
          const interceptors = Interceptor.of(BaseUrl.Url(baseUrl));
          return yield* _(Interceptor.makeAdapter(Adapter.fetch, interceptors));
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
