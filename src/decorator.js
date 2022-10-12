function route(target, {
    kind,
    name
}) {
    if (kind !== 'method') return target

    return async function (request, response) {
        const {
            statusCode,
            data
        } = await target.apply(this, [request, response])

        response.writeHead(statusCode)
        response.end(JSON.stringify(data))
    }
}

module.exports = { route }
