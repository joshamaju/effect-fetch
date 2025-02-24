---
title: Interceptors/Authentication.ts
nav_order: 7
parent: Modules
---

## Authentication overview

Added in v2.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [interceptor](#interceptor)
  - [Basic](#basic)
  - [BearerToken](#bearertoken)

---

# interceptor

## Basic

**Signature**

```ts
export declare const Basic: (username: string, password: string) => Effect.Effect<Response, HttpError, Chain>
```

Added in v2.1.0

## BearerToken

**Signature**

```ts
export declare const BearerToken: (token: string) => Effect.Effect<Response, HttpError, Chain>
```

Added in v2.1.0
