import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";

import { HttpResponse } from "./response/index.js";

import { Fetch } from "../Fetch.js";

export const fetch = (url: string | URL, init?: RequestInit) =>
  Effect.flatMap(Fetch, (fetch_) => fetch_(url, init));

export const fetch_ = flow(
  fetch,
  Effect.map((response) => new HttpResponse(response))
);

export const make = (fetch: Fetch) => Layer.succeed(Fetch, fetch);

export const effect = <R, E>(fetch: Effect.Effect<R, E, Fetch>) =>
  Layer.effect(Fetch, fetch);
