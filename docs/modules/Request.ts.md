---
title: Request.ts
nav_order: 9
parent: Modules
---

## Request overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [arrayBuffer](#arraybuffer)
  - [blob](#blob)
  - [formData](#formdata)
  - [json](#json)
  - [text](#text)
- [constructors](#constructors)
  - [make](#make)
- [mapping](#mapping)
  - [appendBody](#appendbody)
  - [map](#map)

---

# combinators

## arrayBuffer

**Signature**

```ts
export declare const arrayBuffer: (value: Request) => Effect<ArrayBuffer, DecodeError, never>
```

Added in v1.0.0

## blob

**Signature**

```ts
export declare const blob: (value: Request) => Effect<Blob, DecodeError, never>
```

Added in v1.0.0

## formData

**Signature**

```ts
export declare const formData: (value: Request) => Effect<FormData, DecodeError, never>
```

Added in v1.0.0

## json

**Signature**

```ts
export declare const json: (value: Request) => Effect<any, DecodeError, never>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (value: Request) => Effect<string, DecodeError, never>
```

Added in v1.0.0

# constructors

## make

**Signature**

```ts
export declare const make: (url: string | URL, init?: RequestInit) => HttpRequest
```

Added in v1.0.0

# mapping

## appendBody

**Signature**

```ts
export declare const appendBody: (body: Body) => (request: HttpRequest) => Request
```

Added in v1.0.0

## map

**Signature**

```ts
export declare const map: {
  <B>(fn: (request: HttpRequest) => B): (request: HttpRequest) => B
  <B>(request: HttpRequest, fn: (request: HttpRequest) => B): B
}
```

Added in v1.0.0
