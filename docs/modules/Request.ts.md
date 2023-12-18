---
title: Request.ts
nav_order: 4
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
export declare const arrayBuffer: (value: Request) => Effect<never, DecodeError, ArrayBuffer>
```

Added in v1.0.0

## blob

**Signature**

```ts
export declare const blob: (value: Request) => Effect<never, DecodeError, Blob>
```

Added in v1.0.0

## formData

**Signature**

```ts
export declare const formData: (value: Request) => Effect<never, DecodeError, FormData>
```

Added in v1.0.0

## json

**Signature**

```ts
export declare const json: (value: Request) => Effect<never, DecodeError, any>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (value: Request) => Effect<never, DecodeError, string>
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
