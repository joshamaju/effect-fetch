import { test, describe, expect } from "vitest";

import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Layer from "effect/Layer";
import * as Either from "effect/Either";

import * as Fetch from "../src/Fetch.js";
import * as Request from "../src/Request.js";
import * as Response from "../src/Response.js";
import * as Interceptor from "../src/Interceptor.js";
import * as Adapter from "../src/adapters/Fetch.js";
import { DecodeError } from "../src/internal/error.js";

const adapter = Fetch.make(Adapter.fetch);

const base_url_interceptor = Effect.flatMap(Interceptor.Context, (_) => {
  const request = _.request.clone();
  const url = request.url.toString();
  const base_url = "https://reqres.in/api";
  const newUrl = base_url.replace(/\/+$/, "") + "/" + url.replace(/^\/+/, "");
  return _.proceed(Request.make(newUrl, request.init));
});

class Err extends Error {
  readonly _tag = "Err";
}

const error_interceptor = Effect.fail(new Err("error"));

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
      Interceptor.makeFetch([base_url_interceptor]),
      Effect.provide(adapter),
      Fetch.fromEffect
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
      Interceptor.empty,
      Interceptor.add(base_url_interceptor),
      Interceptor.add(error_interceptor)
    );

    const adapter = Fetch.fromEffect(
      Interceptor.makeAdapter(Adapter.fetch, interceptors)
    );

    const result = await pipe(
      Fetch.fetch("/users/2"),
      Effect.flatMap(Response.json),
      Effect.provide(adapter),
      Effect.either,
      Effect.runPromise
    );

    expect(Either.isLeft(result)).toBeTruthy();
    expect((result as Either.Left<Err, any>).left).toEqual({ _tag: "Err" });
  });
});
