import * as Effect from 'effect/Effect'
import { HttpRequest } from './internal/request.js'
import { dual } from 'effect/Function'
import { Body } from './internal/body.js'

export const make = (url: string | URL, init?: RequestInit) => new HttpRequest(url, init)

export const map = dual<
    <B>(fn: (request: HttpRequest) => B) => (request: HttpRequest) => B,
    <B>(request: HttpRequest, fn: (request: HttpRequest) => B) => B
>(2, (request, fn) => fn(request))


export const appendBody = (body: Body) => {
    return (request: HttpRequest) => {
        const { headers = {}, ...init } = request.init ?? {}
        return new HttpRequest(request.url, {
            ...init,
            body: body.value,
            headers: { ...headers, ...body.headers }
        })
    }
}