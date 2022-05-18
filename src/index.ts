import { config } from './config'
import { Handler } from './handler'
import { Parser } from './parsers'
import { SimpleServer } from './server'

const parser = new Parser()
const handler = new Handler(parser)
const server = new SimpleServer({
    handler,
    port: config.port,
})
server.start()
console.log(`Server running at http://127.0.0.1:${config.port}/`)
