/**
 * @since 1.3.0
 */
import { Tag } from "effect/Context";
import * as Layer from 'effect/Layer'
import type { Effect } from "effect/Effect";
import { serviceFunctions } from "effect/Effect";

import { Fetch } from "./Fetch.js";
import { HttpError } from "./internal/error.js";
import { HttpRequest } from "./internal/request.js";

import * as internal from "./internal/client.js";

type Handler = (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Fetch, HttpError, Response>;

/**
 * @since 1.3.0
 * @category model
 */
export interface Client {
  put: Fetch;
  get: Fetch;
  head: Fetch;
  post: Fetch;
  patch: Fetch;
  delete: Fetch;
  options: Fetch;
}

/**
 * @since 1.3.0
 * @category tag
 */
export const Client = Tag<Client>("effect-fetch/Client");

/**
 * @since 1.3.0
 * @category constructor
 */
export const make: Effect<Fetch, never, Client> = internal.make;

/**
 * @since 1.3.0
 * @category constructor
 */
export const layer: Layer.Layer<Fetch, never, Client> = Layer.effect(Client, make)

const functions = serviceFunctions(make);

/**
 * @since 1.3.0
 * @category constructor
 */
export const put: Handler = functions.put;

/**
 * @since 1.3.0
 * @category constructor
 */
export const get: Handler = functions.get;

/**
 * @since 1.3.0
 * @category constructor
 */
export const head: Handler = functions.head;

/**
 * @since 1.3.0
 * @category constructor
 */
export const post: Handler = functions.post;

/**
 * @since 1.3.0
 * @category constructor
 */
export const patch: Handler = functions.patch;

/**
 * @since 1.3.0
 * @category constructor
 */
export const options: Handler = functions.options;

const delete_: Handler = functions.delete;

export {
  /**
   * @since 1.3.0
   * @category constructor
   */
  delete_ as delete,
};
