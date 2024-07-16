import { expect, test } from "vitest";

import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";

import * as Adapter from "../src/Adapters/Fetch.js";
import * as Fetch from "../src/Fetch.js";
import * as Response from "../src/Response.js";
import { DecodeError } from "../src/internal/error.js";

const base_url = "https://reqres.in/api";

const makeClient = <A, E, R>(effect: Effect.Effect<A, E, R | Fetch.Fetch>) => {
  const adapter = Fetch.make(Adapter.fetch);
  return Effect.provide(effect, adapter);
};

test("google", async () => {
  const program = Effect.flatMap(
    Fetch.fetch("https://www.google.com"),
    Response.text
  );

  const result = await Effect.runPromise(makeClient(program));

  expect(result).toContain("Google");
});

test("streaming", async () => {
  const program = pipe(
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
    Stream.runFold("", (a, b) => a + new TextDecoder().decode(b))
  );

  const result = await Effect.runPromise(makeClient(program));

  expect(result).toContain("Google");
});

test("should make request", async () => {
  const program = Effect.flatMap(
    Fetch.fetch(base_url + "/users/2"),
    Response.json
  );
  const result = await Effect.runPromise(makeClient(program));
  expect(result.data.id).toBe(2);
});

test("fetch with Effect.gen", async () => {
  const program = Effect.gen(function* () {
    const fetch = yield* Fetch.Fetch;
    const res = yield* fetch(base_url + "/users/2");
    return yield* Response.json(res);
  });

  const result = await Effect.runPromise(makeClient(program));

  expect(result.data.id).toBe(2);
});
