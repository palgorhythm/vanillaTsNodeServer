import http from 'http'
import fs from 'fs'
import path from 'path'
import { mimeTypes, StatusCode } from './models'
import { Parser } from './parsers'

interface BodyType {
    foo: number
}
interface QueryType {
    filePath: string
}

export class Handler {
    private _parser: Parser
    public constructor(parser: Parser) {
        this._parser = parser
    }
    public async handle(
        request: http.IncomingMessage,
        response: http.ServerResponse
    ): Promise<void> {
        const requestData = await this._parser.parseRequest<
            BodyType,
            QueryType
        >(request)
        const filePath = requestData.query?.filePath
        if (!filePath) {
            throw new Error(`no file path found!`)
        }
        console.log('request received', {
            requestData,
            requestUrl: request.url,
        })

        const extname = String(path.extname(filePath)).toLowerCase()
        const contentType = mimeTypes[extname]
        if (!contentType) {
            response.writeHead(StatusCode.BadRequest, {
                'Content-Type': 'text/html',
            })
            response.end(
                `supplied content type for extension ${extname} not recognized!`
            )
            return
        }

        try {
            const file = fs.readFileSync(filePath)
            response.writeHead(StatusCode.Ok, { 'Content-Type': contentType })
            response.end(file, 'utf-8')
        } catch (err) {
            const error = err as NodeJS.ErrnoException
            if (error.code == 'ENOENT') {
                const responsePayload = { message: 'file not found!' }
                response.writeHead(StatusCode.NotFound, {
                    'Content-Type': 'text/html',
                })
                response.end(JSON.stringify(responsePayload), 'utf-8')
                return
            }
        }
    }
}
