import { describe, expect, test } from "vitest";

import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import PlatformAdapter from "../src/Adapters/Fetch.js";
import * as Http from "../src/Client.js";
import * as Interceptor from "../src/Interceptor.js";
import { TimeoutError } from "../src/Interceptors/Timeout.js";
import BaseUrl from "../src/Interceptors/Url.js";
import { json } from "../src/internal/body.js";
import * as Response from "../src/Response.js";
import { HttpError } from "../src/Error.js";

const base_url = "https://reqres.in/api";

const base_url_interceptor = BaseUrl(base_url);

test("should make client with http methods", async () => {
  const interceptors = Interceptor.of(base_url_interceptor);

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.get("/users/2")(adapter);

  const result = await (E.isRight(res)
    ? Response.json(res.right)
    : Promise.reject(void 0));

  expect(
    (result as Extract<typeof result, { _tag: "Right" }>).right.data.id
  ).toBe(2);
});

test("should make client with base URL for every request", async () => {
  const client = Http.create({ url: base_url, adapter: PlatformAdapter });

  const res = await Http.get("/users/2")(client);

  const result = await (E.isRight(res)
    ? Response.json(res.right)
    : Promise.reject(void 0));

  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("should make client with interceptors", async () => {
  const interceptors = Interceptor.of(base_url_interceptor);
  const client = Http.create({ interceptors, adapter: PlatformAdapter });

  const res = await Http.get("/users/2")(client);

  const result = await (E.isRight(res)
    ? Response.json(res.right)
    : Promise.reject(void 0));

  expect((result as E.Right<any>).right.data.id).toBe(2);
});

test("should attach JSON body and headers", async () => {
  const spy = (chain: Interceptor.Chain) => {
    const headers = new Headers(chain.request.init?.headers);

    expect(chain.request.init?.body).toBe('{"name":"morpheus","job":"leader"}');
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.has("Content-Length")).toBeTruthy();

    return chain.proceed(chain.request);
  };

  const interceptors = pipe(
    Interceptor.of(base_url_interceptor),
    Interceptor.add(spy)
  );

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.post(
    "/users",
    json({ name: "morpheus", job: "leader" })
  )(adapter);

  const result = await (E.isRight(res)
    ? Response.json(res.right)
    : Promise.reject(void 0));

  expect((result as E.Right<any>).right).toMatchObject({
    name: "morpheus",
    job: "leader",
  });
});

test("should attach JSON body and headers with custom headers", async () => {
  const spy = (chain: Interceptor.Chain) => {
    const headers = new Headers(chain.request.init?.headers);
    expect(headers.get("X-API-Key")).toBe("Bearer <APIKEY>");
    return chain.proceed(chain.request);
  };

  const interceptors = pipe(
    Interceptor.of(base_url_interceptor),
    Interceptor.add(spy)
  );

  const adapter = Interceptor.make(interceptors)(PlatformAdapter);

  const res = await Http.post("/users", {
    headers: { "X-API-Key": "Bearer <APIKEY>" },
    body: json({ name: "morpheus", job: "leader" }),
  })(adapter);

  const result = await (E.isRight(res)
    ? Response.json(res.right)
    : Promise.reject(void 0));

  expect((result as E.Right<any>).right).toMatchObject({
    name: "morpheus",
    job: "leader",
  });
});

describe("timeout", () => {
  const program = Http.get("/users/2?delay=10");

  const clock = async function (chain: Interceptor.Chain) {
    const res = chain.proceed(chain.request);
    // yield* TestClock.adjust(Duration.seconds(10));
    return await res;
  };

  test("with number timeout", async () => {
    const client = Http.create({
      timeout: 100,
      url: base_url,
      adapter: PlatformAdapter,
      interceptors: Interceptor.of(clock),
    });

    const result = await program(client);

    expect(E.isLeft(result)).toBeTruthy();
    expect((result as E.Left<any>).left).instanceOf(HttpError);
    expect((result as E.Left<HttpError>).left.cause).instanceOf(TimeoutError);
  });
});

describe("method", () => {
  const check = (method: string) => {
    return async (chain: Interceptor.Chain) => {
      expect(chain.request.init?.method).toBe(method);
      return E.right(new globalThis.Response(""));
    };
  };

  test("POST", async () => {
    const interceptors = Interceptor.of(check("POST"));

    const interceptor = Interceptor.make(interceptors)(PlatformAdapter);

    await Http.post("/users/2")(interceptor);
  });

  test("HEAD", async () => {
    const interceptors = Interceptor.of(check("HEAD"));
    const interceptor = Interceptor.make(interceptors)(PlatformAdapter);
    await Http.head("/users/2")(interceptor);
  });
});
