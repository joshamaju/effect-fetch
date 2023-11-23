import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Console from "effect/Console";
import * as Layer from "effect/Layer";
import * as LogLevel from "effect/LogLevel";
import * as ELogger from "effect/Logger";
import * as Context from "effect/Context";

import * as Fetch from "../src/Fetch.js";
import * as Result from "../src/Response.js";
import * as Request from "../src/Request.js";
import * as Interceptor from "../src/Interceptor.js";
import { Level, Logger } from "../src/interceptors/Logger.js";

import * as AdapterFetch from "../src/adapters/Fetch.js";
import { Interceptor as Intercept } from "effect-fetch/internal/interceptor.js";

const program = Effect.gen(function* (_) {
  const result = yield* _(Fetch.fetch_("/users?delay=10"));
  const users = yield* _(result.json());
  yield* _(Effect.log("DONE"));
  console.log(users);
  // const n = yield* _(Result.filterStatusOkT(result))
});

interface Store {
  md(): string;
}

interface Store2 {
  get(): void;
}

type Identity<A> = A;

interface Fe extends Identity<(typeof globalThis)["fetch"]> {}

const Store = Context.Tag<Store>();
const AB = Context.Tag<Fe>();

class Err {
  readonly _tag = "Err";
}

const base_url = Effect.gen(function* (_) {
  // const store = yield* _(Store);
  // const store2 = yield* _(AB);
  const ctx = yield* _(Interceptor.Context);
  const req = ctx.request.clone();
  const baseURL = "https://reqres.in/api";
  const _url = req.url.toString();
  const url = baseURL.replace(/\/+$/, "") + "/" + _url.replace(/^\/+/, "");

  // yield* _(Effect.fail(new Error("")));

  return yield* _(ctx.proceed(Request.make(url, req.init)));
});

const base_url2 = Effect.gen(function* (_) {
  const store = yield* _(Store);
  // const store2 = yield* _(AB);
  const ctx = yield* _(Interceptor.Context);
  const req = ctx.request.clone();
  // const baseURL = "https://reqres.in/api";
  // const _url = req.url.toString();
  // const url = baseURL.replace(/\/+$/, "") + "/" + _url.replace(/^\/+/, "");

  yield* _(Effect.fail(new Err()));

  // ctx.proceed(req);

  return yield* _(ctx.proceed(req));

  // return new Response("");
});

let j = Interceptor.add(Interceptor.empty, base_url);
let jj = Interceptor.add(j, base_url2);

const interceptors = pipe(
  Interceptor.empty,
  Interceptor.add(base_url),
  Interceptor.add(base_url2),
  // Interceptor.add(
  //   Logger(Level.HEADERS, ["nel", "report-to", "reporting-endpoints"])
  // )
);

const FetchLive = Fetch.fromEffect(
  Interceptor.makeAdapter(
    AdapterFetch.fetch,
    interceptors
  )
);

const n = pipe(
  program,
  Effect.provide(FetchLive),
  Effect.provideService(Store, { md: () => "" }),
  Effect.tapError(Console.error),
  Effect.tapDefect(Console.error),
  Effect.catchTag('Err', e => {
    console.log('Err error: ', e);
    return Effect.unit;
  }),
  // Effect.tapErrorCause(Console.error),
  Effect.runFork
);
