const { randomUUID } = require("crypto")

const isUiDisabled = process.env.UI_DISABLED
let ui

if (!isUiDisabled) {
    const Ui = require('./ui')
    ui = new Ui()
} else ui = { updateGraph: () => {} }

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

const log = (...args) => {
    if (isUiDisabled)
        console.log(...args)
}

function onRequestEnded({
    data,
    response,
    requestStartedAt,
    methodsTimeTracker
}) {
    return () => {
        const requestEndedAt = performance.now()
        let timeDiff = requestEndedAt - requestStartedAt
        let seconds = Math.round(timeDiff)

        data.statusCode = response.statusCode
        data.statusMessage = response.statusMessage
        data.elapsed = timeDiff.toFixed(2).concat('ms')
        log('Benchmark', data)

        const diffTracker = requestEndedAt - methodsTimeTracker[data.method]
        if (diffTracker >= 90) {
            ui.updateGraph(data.method, seconds)
            methodsTimeTracker[data.method] = performance.now()
        }
    }
}

function responseTimeTracker(target, {
    kind,
    name
}) {
    if (kind !== 'method') return target

    return function (request, response) {
        const requestStartedAt = performance.now()
        const afterExecution = target.apply(this, [request, response])

        const requestId = randomUUID()
        const data = {
            requestId,
            name,
            method: request.method,
            url: request.url
        }

        const methodsTimeTracker = {
            GET: performance.now(),
            POST: performance.now()
        }
        const onFinally = onRequestEnded({
            data,
            response,
            requestStartedAt,
            methodsTimeTracker  
        })
        afterExecution.finally(onFinally)

        return afterExecution
    }
}

module.exports = { route, responseTimeTracker }
