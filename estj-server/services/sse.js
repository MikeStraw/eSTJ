const debug  = require('debug')('estj-server')
const EventEmitter = require('events')
const PassThrough = require('stream').PassThrough

const DEFAULT_OPTIONS = {
    pingInterval: 30000        // every 30 seconds
}

const SSE_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'Keep-Alive',
}

// Class for sending Server-Sent Events in a KOA environment.
// Options object is of the form { pingInterval: 30000 }
// Instantiated objects will propagate 'end', 'close' and 'error' events from the underlying stream.
// Once these events are emitted, the instantiated object is no longer usable.
class Sse extends EventEmitter {

    constructor(koaCtx, opts = {}) {
        super()
        this.opts = Object.assign({}, DEFAULT_OPTIONS, opts)
        this.stream = new PassThrough()
        this.pingIntervalID = this.startPingInterval()

        // Event handlers to catch stream ending conditions.
        this.stream.on('end', () => {  // when stream.end() called
            debug('Got stream END event')
            this.destroyStream()
            this.emit('end')
        })
        this.stream.on('close', () => {  // after stream.end() or if client calls EventSource.close()
            debug('Got stream CLOSE event')
            this.destroyStream()
            this.emit('close')
        })
        this.stream.on('error', (err) => {  // if we try to write to closed stream
            debug('Got stream ERROR event')
            this.destroyStream()
            this.emit('error', err)
        })

        koaCtx.set(SSE_HEADERS)
        koaCtx.status = 200
        koaCtx.body = this.stream

        Sse.addClientToPool(this)
    }

    // destroy the SSE stream and remove from the client pool.
    destroyStream() {
        this.stopPingInterval()
        Sse.removeClientFromPool(this)
        this.end()

        delete this.stream
    }

    // end and close the SSE stream to this client
    end() {
        if (this.stream) {
            this.stream.end()
        }
    }

    // send data to this particular client
    // dataObj is an object of the form {
    //     data:  string -or- object         <-- null value will send a ':ok'  which acts like a ping
    //     event: type of Server-Sent Event  <-- if null, no event indicator is sent
    //     id:    ID of this SSE data        <-- if null, no ID indicator is sent
    // }
    send (dataObj)  {
        if (!this.stream) {
            debug.warn('Sse::send - stream has already been destroyed.')
        }
        else {
            const dataString  = getSseData(dataObj)
            const eventString = dataObj.event ? `event: ${dataObj.event}\n` : ''
            const idString    = dataObj.id ? `id: ${dataObj.id}\n` : ''

            const streamBuf = `${idString}${eventString}${dataString}`
            debug(`Sse::send - writing to stream: ${streamBuf}`)
            this.stream.write(`${streamBuf}\n\n`)
        }

    };

    // set up the periodic ping message to the client to keep the connection open.
    // return the ID of the interval
    startPingInterval ()  {
        debug('startPingInterval:  setting up ping interval')
        return setInterval( () => {
            this.stream.write('data: :ping\n\n')
        }, this.opts.pingInterval)
    };

    // stop the periodic ping
    stopPingInterval () {
        debug('stopPingInterval: clearing ping interval')
        if (this.pingIntervalID) {
            clearInterval(this.pingIntervalID)
            delete this.pingIntervalID
        }
    }

    // ****************** static methods
    static addClientToPool(sse) {
        if (!sse  ||  !sse.stream)  {
            debug('Sse::addClientToPool - undefined sse or stream!!!')
        }
        else {
            Sse.clientPool.push(sse)
        }
    }

    static removeClientFromPool(sse) {
        if (sse  &&  sse.stream) {
            debug(`Sse::removeClientFromPool - before pool length = ${Sse.clientPool.length}`)
            const idx = Sse.clientPool.indexOf(sse)
            if (idx > -1) {
                Sse.clientPool.splice(idx, 1)
            }
            debug(`Sse::removeClientFromPool - after pool length = ${Sse.clientPool.length}`)
        }
    }

    static sendAll(dataObj) {
        debug(`Sse::sendAll - client pool length = ${Sse.clientPool.length}`)
        for (let sse of Sse.clientPool) {
            sse.send(dataObj)
        }
    }
}

// A static pool of Sse instances.
Sse.clientPool = []

// Get SSE formatted data from the input
const getSseData = (input) => {
    if (typeof input === 'undefined' || input === null || typeof input.data === 'undefined' || input.data === null)  {
        return 'data: :ok'
    }

    else {
        if (typeof input.data === 'object') {
            return (`data: ${JSON.stringify(input.data)}`)
        }
        else if (typeof input.data === 'string' || typeof input.data === 'number' || typeof input.data === 'boolean') {
            return `data: ${input.data}`
        }
        else {
            debug.warn(`getSseData:  unknown data type: ${typeof input.data}, from input.data: ${input.data}`)
            return 'data: :ok'
        }
    }
}

module.exports = Sse
