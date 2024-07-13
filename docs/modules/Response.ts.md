---
title: Response.ts
nav_order: 10
parent: Modules
---

## Response overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [arrayBuffer](#arraybuffer)
  - [blob](#blob)
  - [formData](#formdata)
  - [json](#json)
  - [text](#text)
- [error](#error)
  - [StatusError](#statuserror)
  - [StatusErrorT](#statuserrort)
- [filtering](#filtering)
  - [filterStatus](#filterstatus)
  - [filterStatusOk](#filterstatusok)
  - [filterStatusOkT](#filterstatusokt)
- [status code](#status-code)
  - [NotOkStatusCode](#notokstatuscode)
  - [OkStatusCode](#okstatuscode)
  - [StatusCode](#statuscode)

---

# combinators

## arrayBuffer

**Signature**

```ts
export declare const arrayBuffer: (value: Response) => Effect<ArrayBuffer, DecodeError, never>
```

Added in v1.0.0

## blob

**Signature**

```ts
export declare const blob: (value: Response) => Effect<Blob, DecodeError, never>
```

Added in v1.0.0

## formData

**Signature**

```ts
export declare const formData: (value: Response) => Effect<FormData, DecodeError, never>
```

Added in v1.0.0

## json

**Signature**

```ts
export declare const json: (value: Response) => Effect<any, DecodeError, never>
```

Added in v1.0.0

## text

**Signature**

```ts
export declare const text: (value: Response) => Effect<string, DecodeError, never>
```

Added in v1.0.0

# error

## StatusError

**Signature**

```ts
export declare const StatusError: typeof internal.StatusError
```

Added in v1.1.0

## StatusErrorT

**Signature**

```ts
export declare const StatusErrorT: any
```

Added in v1.1.0

# filtering

## filterStatus

**Signature**

```ts
export declare const filterStatus: ((
  fn: Predicate<number>
) => (response: Response) => Effect<Response, StatusError, never>) &
  ((response: Response, fn: Predicate<number>) => Effect<Response, StatusError, never>)
```

Added in v1.0.0

## filterStatusOk

**Signature**

```ts
export declare const filterStatusOk: (response: Response) => Effect<Response, StatusError, never>
```

Added in v1.0.0

## filterStatusOkT

**Signature**

```ts
export declare const filterStatusOkT: (
  response: Response
) => Effect<ResponseT<OkStatusCode>, StatusErrorT<NotOkStatusCode>, never>
```

Added in v1.0.0

# status code

## NotOkStatusCode

**Signature**

```ts
export declare const NotOkStatusCode: any
```

Added in v1.1.0

## OkStatusCode

**Signature**

```ts
export declare const OkStatusCode: any
```

Added in v1.1.0

## StatusCode

**Signature**

```ts
export declare const StatusCode: any
```

Added in v1.1.0
