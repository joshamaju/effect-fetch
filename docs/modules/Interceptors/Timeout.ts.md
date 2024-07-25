---
title: Interceptors/Timeout.ts
nav_order: 8
parent: Modules
---

## Timeout overview

Added in v2.1.0

---

<h2 class="text-delta">Table of contents</h2>

- [interceptor](#interceptor)
  - [Timeout](#timeout)

---

# interceptor

## Timeout

**Signature**

```ts
export declare const Timeout: (duration: DurationInput) => Effect.Effect<Response, HttpError | TimeoutException, Chain>
```

Added in v2.1.0
