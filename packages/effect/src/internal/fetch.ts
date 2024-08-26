import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Adapter, Fetch } from "../Fetch.js";
import { HttpResponse } from "./response/index.js";

export const fetch = (url: string | URL, init?: RequestInit) => {
  return Effect.flatMap(Fetch, (fetch) => fetch(url, init));
};

export const fetch_ = (url: string | URL, init?: RequestInit) => {
  return Effect.map(fetch(url, init), (res) => new HttpResponse(res));
};

export const make = (fetch: Adapter) => Layer.succeed(Fetch, fetch);

export const effect = <E, R>(fetch: Effect.Effect<Adapter, E, R>) => {
  return Layer.effect(Fetch, fetch);
};
