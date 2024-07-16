import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

import * as Adapter from "../src/Adapters/Fetch.js";
import * as Fetch from "../src/Fetch.js";
import * as Interceptor from "../src/Interceptor.js";
import { Url as BaseURL } from "../src/Interceptors/Url.js";
import * as Result from "../src/Response.js";

const baseURL = "https://reqres.in/api";

const program = Effect.gen(function* () {
  const result = yield* Fetch.fetch("/users?delay=10");
  const res = yield* Result.filterStatusOkT(result);
  const users = yield* Result.json(res);
  console.log(users);
});

const matchOk = Match.type<Result.StatusOK>().pipe(
  Match.when(200, () => "200"),
  Match.when(201, () => "201"),
  Match.when(202, () => "202"),
  Match.when(203, () => "203"),
  Match.when(204, () => "204"),
  Match.when(205, () => "205"),
  Match.when(206, () => "206"),
  Match.when(207, () => "207"),
  Match.when(208, () => "208"),
  Match.when(226, () => "226"),
  Match.exhaustive
);

const matchNotOk = Match.type<Response>().pipe(
  Match.when(res => res.status == 404, () => "Not Found"),
  Match.when(res => res.status == 500, () => "Internal server error"),
  Match.orElse(() => "noop")
);

const status = Fetch.fetch("/users/2").pipe(
  Effect.andThen(Result.filterStatusOk),
  Effect.andThen((res) => matchOk(res.status as Result.StatusOK)),
  Effect.catchTag('StatusError', res => Effect.succeed(matchNotOk(res.response))),
  Effect.andThen(Effect.log),
  Effect.catchAll(Effect.log),
);

makeClient(Effect.all([status, program])).pipe(
  Effect.withLogSpan("status"),
  Effect.runFork
);

function makeClient<A, E, R>(effect: Effect.Effect<A, E, R | Fetch.Fetch>) {
  const interceptors = Interceptor.empty().pipe(
    Interceptor.add(BaseURL(baseURL))
  );

  const interceptor = Interceptor.provide(
    Interceptor.make(interceptors),
    Adapter.fetch
  );

  return Effect.provide(effect, Fetch.effect(interceptor));
}
