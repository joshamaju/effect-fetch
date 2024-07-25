# effect-fetch

## 2.1.0

### Minor Changes

- 7d253cd: Add Client layer construction function
- fd6589c: Rename `Interceptor.Context` to `Interceptor.Chain` for accessing the interceptor request chain inside interceptors
- e1f5de2: Add request timeout interceptor
- a9b8769: Rename the Typescript type for exported HTTP status codes
- 928eb6c: Add support for request timeout when using Client
- ec988a5: Add request body helpers that attach body data and required headers for json, text and form body types to Client

### Patch Changes

- 587a942: Use correct build file path for default interceptors
- 3bbdb55: Remove custom pretty logger attached to Logger interceptor
- 03b687e: Update effect peer dependency version
- d7f818e: Accept number as timeout durationfor Timeout interceptor

## 2.0.0

### Major Changes

- 7d0b6ae: Upgrade effect

### Minor Changes

- da12ae5: Provide client type simplifier

## 1.4.0

### Minor Changes

- f08a8eb: Provide constructor to clone/copy existing interceptors
- a86b2ab: Add client constructor factory function
- a70e096: Client with default http methods

### Patch Changes

- a31a0d4: Add default response status OK filter

## 1.3.0

### Minor Changes

- 35673ad: Client with default http methods
- 275041a: Base URL interceptor that attaches a base URL to every request

## 1.2.7

### Patch Changes

- 111d1f2: upgrade effect

## 1.2.6

### Patch Changes

- 2929a20: include package typescript types

## 1.2.5

### Patch Changes

- 17f50a3: add package main entry

## 1.2.4

### Patch Changes

- 0baf89c: re-export all modules from single entry point

## 1.2.3

### Patch Changes

- 64f5280: Fix Interceptor reference in Logger interceptor

## 1.2.2

### Patch Changes

- 121ed1e: Upgrade effect

## 1.2.1

### Patch Changes

- f0164e6: Include Error module in package exports

## 1.2.0

### Minor Changes

- 94cb727: refactor interceptors from array to chunk

## 1.1.1

### Patch Changes

- e3cb796: Type inference for accumulated interceptors error channel

## 1.1.0

### Minor Changes

- 6dd1a4d: Expose error classes and types
