---
title: Fetch.ts
nav_order: 4
parent: Modules
---

## Fetch overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [effect](#effect)
  - [fetch](#fetch)
  - [fetch\_](#fetch_)
  - [make](#make)
- [model](#model)
  - [Adapter (interface)](#adapter-interface)
- [tag](#tag)
  - [Fetch (class)](#fetch-class)

---

# constructors

## effect

Constructs a `Fetch` layer from the specified effect that produces the given platform adapter

**Signature**

```ts
export declare const effect: <R, E>(fetch: Effect<Adapter, E, R>) => Layer<Fetch, E, R>
```

Added in v1.0.0

## fetch

**Signature**

```ts
export declare const fetch: (url: string | URL, init?: RequestInit | undefined) => Effect<Response, HttpError, Fetch>
```

Added in v1.0.0

## fetch\_

Constructs a request whose response is a `Response` wrapper with the decode methods replace with their `Effect` conterparts

**Signature**

```ts
export declare const fetch_: (
  url: string | URL,
  init?: RequestInit | undefined
) => Effect<HttpResponse, HttpError, Fetch>
```

Added in v1.0.0

## make

Constructs a `Fetch` layer using the given platform adapter

**Signature**

```ts
export declare const make: (fetch: Adapter) => Layer<Fetch, never, never>
```

Added in v1.0.0

# model

## Adapter (interface)

**Signature**

```ts
export interface Adapter {
  (url: string | URL | HttpRequest, init?: RequestInit): Effect<Response, HttpError, never>
}
```

Added in v1.0.0

# tag

## Fetch (class)

**Signature**

```ts
export declare class Fetch
```

Added in v1.0.0
