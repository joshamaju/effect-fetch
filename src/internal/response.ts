import * as Effect from 'effect/Effect'

export class DecodeError {
    readonly _tag = 'DecodeError'
    constructor(readonly cause: unknown) {}
}

const to = <T>(fn: ((response: Response) => Promise<T>)) => {
    return (response: Response) => Effect.tryPromise({
        try: () => fn(response),
        catch: error => new DecodeError(error)
    })
}

export const json = to(response => response.json())

export const blob = to(response => response.blob())

export const formData = to(response => response.formData())

export const arrayBuffer = to(response => response.arrayBuffer())

export const text = to(response => response.text())

export class HttpResponse {
    constructor(readonly response: Response) { }

    get headers(): Headers {
        return this.response.headers
    }

    get ok(): boolean {
        return this.response.ok
    }

    get redirected(): boolean {
        return this.response.redirected
    }

    get status(): number {
        return this.response.status
    }

    get statusText(): string {
        return this.response.statusText
    }

    get type(): ResponseType {
        return this.response.type
    }

    get url(): string {
        return this.response.url
    }

    get body(): ReadableStream<Uint8Array> | null {
        return this.response.body
    }

    get bodyUsed(): boolean {
        return this.response.bodyUsed
    }

    clone(): Effect.Effect<never, Error, Response> {
        return Effect.try({
            try: () => this.response.clone(),
            catch: error => error as Error
        })
    }

    arrayBuffer(): Effect.Effect<never, DecodeError, ArrayBuffer> {
        return arrayBuffer(this.response)
    }

    blob(): Effect.Effect<never, DecodeError, Blob> {
        return blob(this.response)
    }

    formData(): Effect.Effect<never, DecodeError, FormData> {
        return formData(this.response)
    }

    json(): Effect.Effect<never, DecodeError, any> {
        return json(this.response)
    }

    text(): Effect.Effect<never, DecodeError, string> {
        return text(this.response)
    }
}