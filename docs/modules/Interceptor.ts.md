---
title: Interceptor.ts
nav_order: 3
parent: Modules
---

## Interceptor overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [add](#add)
- [constructors](#constructors)
  - [empty](#empty)
  - [makeAdapter](#makeadapter)
  - [makeFetch](#makefetch)
  - [of](#of)
- [model](#model)
  - [Context (interface)](#context-interface)
- [tag](#tag)
  - [Context](#context)

---

# combinators

## add

**Signature**

```ts
export declare const add: {
  <T extends internal.Interceptor<any, any>>(
    interceptor: T
  ): <R, E>(
    interceptors: internal.Interceptors<R, E>
  ) => T extends internal.Interceptor<infer R2, infer E2> ? internal.Interceptors<R | R2, E | E2> : never
  <R, E, T extends internal.Interceptor<any, any>>(
    interceptors: internal.Interceptors<R, E>,
    interceptor: T
  ): T extends internal.Interceptor<infer R2, infer E2> ? internal.Interceptors<R | R2, E | E2> : never
}
```

Added in v1.0.0

# constructors

## empty

**Signature**

```ts
export declare const empty: () => Interceptors<never, never>
```

Added in v1.0.0

## makeAdapter

Provides the given platform adapter to the interceptor `Fetch` wrapper

**Signature**

```ts
export declare const makeAdapter: {
  <R, E>(interceptors: internal.Interceptors<R, E>): (fetch: Fetch) => Effect<Exclude<R, Context>, E, Fetch>
  <R, E>(fetch: Fetch, interceptors: internal.Interceptors<R, E>): Effect<Exclude<R, Context>, E, Fetch>
}
```

Added in v1.0.0

## makeFetch

Creates the intercepting wrapper around the provided platform adapter

**Signature**

```ts
export declare const makeFetch: <R, E>(
  interceptors: internal.Interceptors<R, E>
) => Effect<Exclude<R, Context> | Fetch, E, Fetch>
```

Added in v1.0.0

## of

**Signature**

```ts
export declare const of: <R, E>(interceptor: internal.Interceptor<R, E>) => internal.Interceptors<R, E>
```

Added in v1.2.0

# model

## Context (interface)

**Signature**

```ts
export interface Context extends internal.Context {}
```

Added in v1.0.0

# tag

## Context

**Signature**

```ts
export declare const Context: Tag<internal.Context, internal.Context>
```

Added in v1.0.0
