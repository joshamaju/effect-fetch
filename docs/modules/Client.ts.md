---
title: Client.ts
nav_order: 2
parent: Modules
---

## Client overview

Added in v1.3.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructor](#constructor)
  - [create](#create)
  - [delete](#delete)
  - [get](#get)
  - [head](#head)
  - [layer](#layer)
  - [make](#make)
  - [options](#options)
  - [patch](#patch)
  - [post](#post)
  - [put](#put)
- [model](#model)
  - [Handlers (interface)](#handlers-interface)
- [tag](#tag)
  - [Client (class)](#client-class)

---

# constructor

## create

**Signature**

```ts
export declare const create: <E = never, R = never>(
  config: Config<E, R>
) => Effect<Handlers, HttpError | E, Exclude<Exclude<R, Context>, Fetch>>
```

Added in v1.4.0

## delete

**Signature**

```ts
export declare const delete: (url: string | URL | HttpRequest, init?: RequestInit | undefined) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## get

**Signature**

```ts
export declare const get: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## head

**Signature**

```ts
export declare const head: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## layer

**Signature**

```ts
export declare const layer: Layer<Client, never, Fetch>
```

Added in v1.3.0

## make

**Signature**

```ts
export declare const make: Effect<Handlers, never, Fetch>
```

Added in v1.3.0

## options

**Signature**

```ts
export declare const options: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## patch

**Signature**

```ts
export declare const patch: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## post

**Signature**

```ts
export declare const post: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

## put

**Signature**

```ts
export declare const put: (
  url: string | URL | HttpRequest,
  init?: RequestInit | undefined
) => Effect<Response, StatusError | HttpError, Fetch>
```

Added in v1.3.0

# model

## Handlers (interface)

**Signature**

```ts
export interface Handlers {
  put: Handler
  get: Handler
  head: Handler
  post: Handler
  patch: Handler
  delete: Handler
  options: Handler
}
```

Added in v1.3.0

# tag

## Client (class)

**Signature**

```ts
export declare class Client
```

Added in v1.3.0
