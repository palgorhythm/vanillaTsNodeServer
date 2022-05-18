import http from 'http'

const makeRequest = async <RequestBodyType, ResponseBodyType>({
    path,
    data,
    method,
}: {
    path: string
    data: RequestBodyType
    method: string
}): Promise<ResponseBodyType | string> => {
    const payload = JSON.stringify(data)

    const options = {
        hostname: '127.0.0.1',
        port: 8080,
        path,
        method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
        },
    }

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            res.on('data', (d: Buffer) => {
                const stringifiedResponse = d.toString('utf-8')
                if (typeof stringifiedResponse === 'string') {
                    resolve(stringifiedResponse)
                } else {
                    resolve(JSON.parse(stringifiedResponse) as ResponseBodyType)
                }
            })
        })
        req.on('error', (error) => {
            reject(error)
        })
        req.write(payload)
        req.end()
    })
}

const main = async (): Promise<void> => {
    try {
        const result = await makeRequest({
            path: '/foo',
            data: { foo: 4 },
            method: 'POST',
        })
        console.log({ result })
    } catch (err) {
        console.error(`error making request`, err)
    }
}

void main()
