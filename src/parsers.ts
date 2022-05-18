import http from 'http'
import { URL } from 'url'

export class Parser {
    public async parseRequest<BodyType = unknown, QueryType = unknown>(
        request: http.IncomingMessage
    ): Promise<{ body?: BodyType | null; query?: QueryType }> {
        return {
            body: await this._parseRequestBody(request),
            query: this._parseQueryParams(request),
        }
    }

    private async _parseRequestBody<T = unknown>(
        request: http.IncomingMessage
    ): Promise<T | undefined> {
        const buffers = []
        for await (const chunk of request) {
            buffers.push(chunk)
        }
        const data = Buffer.concat(buffers).toString() as string | undefined
        return data ? (JSON.parse(data) as T) : undefined
    }

    private _parseQueryParams<T = unknown>(request: http.IncomingMessage): T {
        if (!request.url) {
            throw new Error(
                `Cannot parse query params and body with no request URL!`
            )
        }
        const urlInstance = new URL(
            request.url,
            `http://${request.headers.host}`
        )
        return urlInstance.searchParams as unknown as T
    }
}
