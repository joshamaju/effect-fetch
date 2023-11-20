import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Console from 'effect/Console'

import * as Fetch from "../src/Fetch.js";
import * as Result from "../src/Response.js";
import * as Request from "../src/Request.js";
import * as Interceptor from "../src/Interceptor.js";
import { Level, Logger } from "../src/interceptors/Logger.js";

import * as AdapterFetch from "../src/adapters/Fetch.js";
import { Interceptor as Intercept } from "effect-fetch/internal/interceptor.js";

const program = Effect.gen(function* (_) {
  const result = yield* _(Fetch.fetch_("https://reqres.in/api/users"));
  const users = yield* _(result.json());
  console.log(users);
  // const n = yield* _(Result.filterStatusOkT(result))
});

// const l = Logger(Level.BASIC);

// const m: Intercept = (ctx) => {
//   return Effect.gen(function* (_) {
//     console.log("start");
//     const res = yield* _(ctx.proceed(ctx.request()));
//     console.log("done");
//     return res;
//   });
// };

const FetchLive = Fetch.effect(Interceptor.make(AdapterFetch.fetch, Logger(Level.HEADERS)));

pipe(
  program,
  Effect.provide(FetchLive),
  Effect.tapError(Console.error),
  Effect.tapDefect(Console.error),
//   Effect.tapErrorCause(Console.error),
  Effect.runFork
);
