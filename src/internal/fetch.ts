import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";

import { HttpResponse } from "./response/index.js";
import { Adapter, Fetch } from "../Fetch.js";

export const fetch = (url: string | URL, init?: RequestInit) => {
  return Effect.flatMap(Fetch, (fetch_) => fetch_(url, init));
};

export const fetch_ = flow(
  fetch,
  Effect.map((response) => new HttpResponse(response))
);

export const make = (fetch: Adapter) => Layer.succeed(Fetch, fetch);

export const effect = <E, R>(fetch: Effect.Effect<Adapter, E, R>) => {
  return Layer.effect(Fetch, fetch);
};
