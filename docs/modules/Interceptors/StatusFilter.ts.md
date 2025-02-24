---
title: Interceptors/StatusFilter.ts
nav_order: 9
parent: Modules
---

## StatusFilter overview

Added in v2.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [interceptor](#interceptor)
  - [Status](#status)
  - [StatusOK](#statusok)

---

# interceptor

## Status

**Signature**

```ts
export declare const Status: (fn: Predicate<number>) => Effect.Effect<Response, StatusError | HttpError, Chain>
```

Added in v2.1.0

## StatusOK

**Signature**

```ts
export declare const StatusOK: Effect.Effect<Response, StatusError | HttpError, Chain>
```

Added in v2.1.0
