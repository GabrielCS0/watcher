const { responseTimeTracker, route } = require("./decorator")
const { createServer } = require('http')
const { once } = require("events")
const { randomUUID } = require("crypto")

const database = new Map()

class Server {
    @responseTimeTracker
    @route
    static async handler(request, response) {
        if (request.method === "POST") {
            const data = await once(request, "data")
            const user = JSON.parse(data)
            
            user.id = randomUUID()
            database.set(user.id, user)
            
            return {
                statusCode: 201,
                data: user
            }
        }

        return {
            statusCode: 200,
            data: [...database.values()]
        }
    }
}

const server = new Server()
createServer(Server.handler)
    .listen(3001, () => console.log('Server is running at 3001'))
