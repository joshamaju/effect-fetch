export class HttpError {
  readonly _tag = "HttpError";
  constructor(readonly cause: unknown) {}
}

export class DecodeError {
  readonly _tag = "DecodeError";
  constructor(readonly cause: unknown) {}
}
