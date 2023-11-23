import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";

import { HttpError } from "./error.js";
import { HttpRequest } from "./request.js";
import { HttpResponse } from "./response/index.js";

export interface Fetch {
  (url: string | URL | HttpRequest, init?: RequestInit): Effect.Effect<
    never,
    HttpError,
    Response
  >;
}

export const Fetch = Context.Tag<Fetch>("effect-fetch/Fetch");

export const fetch = (url: string | URL, init?: RequestInit) =>
  Effect.flatMap(Fetch, (fetch_) => fetch_(url, init));

export const fetch_ = flow(
  fetch,
  Effect.map((response) => new HttpResponse(response))
);

export const make = (fetch: Fetch) => Layer.succeed(Fetch, fetch);

export const fromEffect = <R, E>(fetch: Effect.Effect<R, E, Fetch>) =>
  Layer.effect(Fetch, fetch);
