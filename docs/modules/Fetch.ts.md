---
title: Fetch.ts
nav_order: 2
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
  - [Fetch (interface)](#fetch-interface)
- [tag](#tag)
  - [Fetch](#fetch-1)

---

# constructors

## effect

Constructs a `Fetch` layer from the specified effect that produces the given platform adapter

**Signature**

```ts
export declare const effect: <R, E>(fetch: Effect<R, E, Fetch>) => Layer<R, E, Fetch>
```

Added in v1.0.0

## fetch

**Signature**

```ts
export declare const fetch: (url: string | URL, init?: RequestInit | undefined) => Effect<Fetch, HttpError, Response>
```

Added in v1.0.0

## fetch\_

Constructs a request whose response is a `Response` wrapper with the decode methods replace with their `Effect` conterparts

**Signature**

```ts
export declare const fetch_: (
  url: string | URL,
  init?: RequestInit | undefined
) => Effect<Fetch, HttpError, HttpResponse>
```

Added in v1.0.0

## make

Constructs a `Fetch` layer using the given platform adapter

**Signature**

```ts
export declare const make: (fetch: Fetch) => Layer<never, never, Fetch>
```

Added in v1.0.0

# model

## Fetch (interface)

**Signature**

```ts
export interface Fetch {
  (url: string | URL | HttpRequest, init?: RequestInit): Effect<never, HttpError, Response>
}
```

Added in v1.0.0

# tag

## Fetch

**Signature**

```ts
export declare const Fetch: Tag<Fetch, Fetch>
```

Added in v1.0.0
