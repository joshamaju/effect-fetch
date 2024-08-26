import { expect, test } from "vitest";

import * as E from "fp-ts/Either";

import PlatformAdapter from "../src/Adapters/Fetch.js";
import { HttpError } from "../src/Error.js";
import * as Http from "../src/index.js";
import { HttpResponse } from "../src/Response.js";

const base_url = "https://reqres.in/api";

const makeClient = (
  fn: <E>(
    fetch: Http.Fetch<E>
  ) => Promise<E.Either<E | HttpError, HttpResponse>>
) => {
  return fn(PlatformAdapter);
};

test("google", async () => {
  const res = await makeClient(Http.fetch("https://www.google.com"));
  const result = await Http.chain(res, (r) => r.text());
  expect((result as E.Right<string>).right).toContain("Google");
});

test("streaming", async () => {
  const program = Http.fetch_("https://www.google.com");

  const res = await program(PlatformAdapter);

  let result = "";

  if (E.isRight(res)) {
    if (res.right.body) {
      for await (const chunk of res.right.body) {
        result += new TextDecoder().decode(chunk);
      }
    }
  }

  expect(result).toContain("Google");
});

test("should make request", async () => {
  const res = await makeClient(Http.fetch(base_url + "/users/2"));
  const result = await Http.chain(res, (_) => _.json());
  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("should be able to abort request", async () => {
  const controller = new AbortController();

  const req = Http.fetch(base_url + "/users/2?delay=10", {
    signal: controller.signal,
  });

  let timeout = setTimeout(() => {
    controller.abort();
    clearTimeout(timeout);
  }, 500);

  const res = await req(PlatformAdapter);
  const result = await Http.chain(res, (_) => _.json());

  const { cause } = (result as Extract<typeof result, { _tag: "Left" }>).left;

  expect(cause).toBeInstanceOf(DOMException);
  expect((cause as DOMException).name).toBe("AbortError");
});
