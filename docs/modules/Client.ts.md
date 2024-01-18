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
  - [Client (interface)](#client-interface)
- [tag](#tag)
  - [Client](#client)

---

# constructor

## delete

**Signature**

```ts
export declare const delete: Handler
```

Added in v1.3.0

## get

**Signature**

```ts
export declare const get: Handler
```

Added in v1.3.0

## head

**Signature**

```ts
export declare const head: Handler
```

Added in v1.3.0

## layer

**Signature**

```ts
export declare const layer: Layer.Layer<Fetch, never, Client>
```

Added in v1.3.0

## make

**Signature**

```ts
export declare const make: Effect<Fetch, never, Client>
```

Added in v1.3.0

## options

**Signature**

```ts
export declare const options: Handler
```

Added in v1.3.0

## patch

**Signature**

```ts
export declare const patch: Handler
```

Added in v1.3.0

## post

**Signature**

```ts
export declare const post: Handler
```

Added in v1.3.0

## put

**Signature**

```ts
export declare const put: Handler
```

Added in v1.3.0

# model

## Client (interface)

**Signature**

```ts
export interface Client {
  put: Fetch
  get: Fetch
  head: Fetch
  post: Fetch
  patch: Fetch
  delete: Fetch
  options: Fetch
}
```

Added in v1.3.0

# tag

## Client

**Signature**

```ts
export declare const Client: Tag<Client, Client>
```

Added in v1.3.0
