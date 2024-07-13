---
title: Interceptor.ts
nav_order: 6
parent: Modules
---

## Interceptor overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [add](#add)
- [constructor](#constructor)
  - [copy](#copy)
- [constructors](#constructors)
  - [empty](#empty)
  - [make](#make)
  - [of](#of)
  - [provide](#provide)
- [model](#model)
  - [Chain (interface)](#chain-interface)
  - [Interceptor (interface)](#interceptor-interface)
  - [Interceptors (type alias)](#interceptors-type-alias)
- [tag](#tag)
  - [Context (class)](#context-class)

---

# combinators

## add

**Signature**

```ts
export declare const add: {
  <T extends Interceptor<any, any>>(
    interceptor: T
  ): <E, R>(
    interceptors: Interceptors<E, R>
  ) => T extends Interceptor<infer R2, infer E2> ? Interceptors<E | R2, R | E2> : never
  <T extends Interceptor<any, any>, E, R>(
    interceptors: Interceptors<E, R>,
    interceptor: T
  ): T extends Interceptor<infer R2, infer E2> ? Interceptors<E | R2, R | E2> : never
}
```

Added in v1.0.0

# constructor

## copy

**Signature**

```ts
export declare const copy: <E, R>(interceptors: Interceptors<E, R>) => Interceptors<E, R>
```

Added in v1.4.0

# constructors

## empty

**Signature**

```ts
export declare const empty: () => Interceptors<never, never>
```

Added in v1.0.0

## make

Creates the intercepting wrapper around the provided platform adapter

**Signature**

```ts
export declare const make: <E, R>(interceptors: Interceptors<E, R>) => Effect<Adapter, E, Exclude<R, Context> | Fetch>
```

Added in v2.0.0

## of

**Signature**

```ts
export declare const of: <E, R>(interceptor: Interceptor<E, R>) => Interceptors<E, R>
```

Added in v1.2.0

## provide

Provides the given platform adapter to the interceptor `Fetch` wrapper

**Signature**

```ts
export declare const provide: {
  <E, R>(fetch: Adapter): (interceptor: Effect<Adapter, E, Fetch | R>) => Effect<Adapter, E, Exclude<R, Fetch>>
  <E, R>(interceptor: Effect<Adapter, E, Fetch | R>, fetch: Adapter): Effect<Adapter, E, Exclude<R, Fetch>>
}
```

Added in v2.0.0

# model

## Chain (interface)

**Signature**

```ts
export interface Chain {
  request: HttpRequest
  proceed(request: HttpRequest): Effect<Response, HttpError, never>
}
```

Added in v1.0.0

## Interceptor (interface)

**Signature**

```ts
export interface Interceptor<E, R> extends Effect<Response, E, R | Context> {}
```

Added in v1.2.3

## Interceptors (type alias)

**Signature**

```ts
export type Interceptors<E, R> = Chunk.Chunk<Interceptor<E, R>>
```

Added in v1.2.3

# tag

## Context (class)

**Signature**

```ts
export declare class Context
```

Added in v1.0.0
