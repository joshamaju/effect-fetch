import * as Effect from 'effect/Effect'
import { identity } from 'effect/Function'
import {pipeArguments, Pipeable} from 'effect/Pipeable'

const RequestTypeId = Symbol.for('effect-fetch/Request')
type RequestTypeId = typeof RequestTypeId

interface IHttpRequest extends Pipeable {}

export class HttpRequest implements IHttpRequest {

    private _request: Request | null = null;

    constructor(readonly url_: string | URL | HttpRequest, readonly init?: RequestInit) { }

    get request(): Request {
        if (this._request !== null) {
            return this._request
        }

        const req = this.url_ instanceof HttpRequest ? this.url_.request : new Request(this.url_, this.init)
        this._request = req;
        return req;
    }

    get url(): string {
        return this.request.url
    }

    get cache(): RequestCache {
        return this.request.cache
    }

    get credentials(): RequestCredentials {
        return this.request.credentials
    }

    get destination(): RequestDestination {
        return this.request.destination
    }

    get headers(): Headers {
        return this.request.headers
    }

    get integrity(): string {
        return this.request.integrity
    }

    get keepalive(): boolean {
        return this.request.keepalive
    }

    get method(): string {
        return this.request.method
    }

    get mode(): RequestMode {
        return this.request.mode
    }

    get redirect(): RequestRedirect {
        return this.request.redirect
    }

    get referrer(): string {
        return this.request.referrer
    }

    get referrerPolicy(): ReferrerPolicy {
        return this.request.referrerPolicy
    }

    get signal(): AbortSignal {
        return this.request.signal
    }

    get body(): ReadableStream<Uint8Array> | null {
        return this.request.body
    }

    get bodyUsed(): boolean {
        return this.request.bodyUsed
    }

    clone(): HttpRequest {
        return new HttpRequest(this.url, this.init)
    }

    arrayBuffer(): Effect.Effect<never, Error, ArrayBuffer> {
        return Effect.tryPromise({
            try: () => this.request.arrayBuffer(),
            catch: error => error as Error
        })
    }

    blob(): Effect.Effect<never, Error, Blob> {
        return Effect.tryPromise({
            try: () => this.request.blob(),
            catch: error => error as Error
        })
    }

    formData(): Effect.Effect<never, Error, FormData> {
        return Effect.tryPromise({
            try: () => this.request.formData(),
            catch: error => error as Error
        })
    }

    json(): Effect.Effect<never, Error, any> {
        return Effect.tryPromise({
            try: () => this.request.json(),
            catch: error => error as Error
        })
    }

    text(): Effect.Effect<never, Error, string> {
        return Effect.tryPromise({
            try: () => this.request.text(),
            catch: error => error as Error
        })
    }

    pipe() {
        return pipeArguments(this, arguments)
    }
}