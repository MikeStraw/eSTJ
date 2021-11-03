const BodyParser  = require('koa-bodyparser')
const cors        = require('koa2-cors')
const debug       = require('debug')('estj-server')
const logger      = require('koa-logger')
const Koa         = require('koa')
const routesApi   = require('./routes/api')
const routesLogin = require('./routes/login')
const sseRoute    = require('./routes/sse')
const staticPath  = require('koa-static')

const app = new Koa()
app.use(logger())
app.use(cors())
app.use(staticPath('./public'))
app.use(BodyParser())

// Define the last-chance error middleware
app.use(async (ctx, next) => {
    try {
        await next()
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.statusCode || err.status || 500
        ctx.body = {
            message: err.message
        }
    }
})

app.use(staticPath('./public'))  // serve estj-client built index.html from /public
app.use(routesLogin.routes()).use(routesLogin.allowedMethods())
app.use(routesApi.routes()).use(routesApi.allowedMethods())
app.use(sseRoute.routes()).use(sseRoute.allowedMethods())

function normalizePort(val) {
    const port = parseInt(val, 10)

    if (isNaN(port)) {return val}    // named pipe
    if (port >= 0)   {return port}   // port number

    return false
}


module.exports = {
    server: null,     // http server

    startServer: function(listenPort) {
        const defaultPort = '3000'
        const port = listenPort ? normalizePort(listenPort) : normalizePort(process.env.PORT || defaultPort)
        debug(`starting koa app, listening on port ${port}`)

        this.server = app.listen(port)
        return (this.server)
    },
    stopServer: function() {
        console.log('stopping the KOA server ....')
        if(this.server) {
            this.server.close()
        }
    }
}
