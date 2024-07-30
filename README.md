# effect-fetch

[![Publish to npm](https://github.com/joshamaju/effect-fetch/actions/workflows/release.yml/badge.svg)](https://github.com/joshamaju/effect-fetch/actions/workflows/release.yml)

`fetch` but with super-powers

- 🖇 Interceptors
- 🔐 Strongly typed errors
- 🕓 Timeouts

## Install

```bash
npm install effect-fetch effect
```

```bash
yarn add effect-fetch effect
```

```bash
pnpm add effect-fetch effect
```

```html
<script src="https://unpkg.com/effect-fetch/dist/index.js"></script>
```

> `effect` is a required peer dependency

## Example

```ts
import * as Effect from "effect/Effect";

import * as Fetch from "effect-fetch/Fetch";
import * as Result from "effect-fetch/Response";
import * as Adapter from "effect-fetch/Adapters/Fetch";

const program = Effect.gen(function* () {
  const result = yield* Fetch.fetch("/users");
  const res = yield* Result.filterStatusOk(result);
  const users = yield* Result.json(res);
});

// or
const program = Effect.gen(function* () {
  const fetch = yield* Fetch.Fetch;
  const result = yield* fetch("/users");
  const res = yield* Result.filterStatusOk(result);
  const users = yield* Result.json(res);
});
```

### With interceptor

```ts
import * as Interceptor from "effect-fetch/Interceptor";
import { Url as BaseURL } from "effect-fetch/interceptors/Url";

const baseURL = "https://reqres.in/api";

// our list of interceptors
const interceptors = Interceptor.of(BaseURL(baseURL));

// make function that executes our interceptors
const interceptor = Interceptor.provide(
  Interceptor.make(interceptors),
  Adapter.fetch
);

// we finally make the HTTP adapter using the native Fetch API
const adapter = Fetch.effect(interceptor);

const result = await Effect.runPromise(Effect.provide(program, adapter));
```

## POST Request

```ts
const program = Effect.gen(function* () {
  const result = yield* Fetch.fetch("/users", { method: "POST" });
  const res = yield* Result.filterStatusOk(result);
  const users = yield* Result.json(res);
});
```

## Interceptors

`effect-fetch` ships with default interceptors

- Base URL
- Timeout
- Logger
- Status Filter
- Bearer and Basic authentication

### Writing your own interceptor

```ts
import * as Interceptor from "effect-fetch/Interceptor";

const program = Effect.gen(function* () {
  const chain = yield* Interceptor.Chain;
  const clone = chain.request.clone(); // do something with request
  const response = yield* chain.proceed(chain.request);
  // do something with response
  return response;
});
```

## Error handling

```ts
import * as Interceptor from "effect-fetch/Interceptor";
import { StatusOK } from "effect-fetch/interceptors/StatusFilter";

// Effect<string, DecodeError, Fetch>
const program = Effect.gen(function* () {
  const result = yield* Fetch.fetch("/users");
  return yield* Result.text(res);
});

const interceptors = Interceptor.empty().pipe(
  Interceptor.add(BaseURL(baseURL)),
  Interceptor.add(StatusOK) // Effect<Response, StatusError, Fetch>
);

const interceptor = Interceptor.provide(
  Interceptor.make(interceptors),
  Adapter.fetch
);

const adapter = Fetch.effect(interceptor);

// Interceptors errors get carried over into the final computation type.
// Unlike other HTTP libraries, we don't loose type information

// Effect<string, DecodeError | StatusError, Fetch>
const result = Effect.provide(program, adapter);
```

[more examples](/test)
