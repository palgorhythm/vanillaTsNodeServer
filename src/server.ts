import http from 'http'
import { Handler } from './handler'
import { StatusCode } from './models'

export interface ServerConfig {
    handler: Handler
    port: number
}

export class SimpleServer {
    private _handler: Handler
    private _port: number

    public constructor(config: ServerConfig) {
        this._handler = config.handler
        this._port = config.port
    }

    public start(): void {
        const wrappedHandler = this._wrapWithCatch(
            this._handler.handle.bind(this._handler)
        )
        http.createServer(wrappedHandler).listen(this._port)
    }

    private _wrapWithCatch(
        handler: http.RequestListener
    ): http.RequestListener {
        const handlerWithCatch: http.RequestListener = async (
            req,
            res
        ): Promise<void> => {
            try {
                await handler(req, res)
                return
            } catch (err) {
                console.error(`caught error`, err)
                res.writeHead(StatusCode.InternalServerError)
                res.end('Internal server error')
                return
            }
        }
        return handlerWithCatch
    }
}
