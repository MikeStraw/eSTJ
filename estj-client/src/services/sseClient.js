import apiSvc from './api'
import mitt from 'mitt'

const sseBus = mitt()
let   sseSource
const sseClient = {

    /**
     * Connect to the server's SSE URL. The URL information comes from the API service.
     * When SSE data arrives, a dataUpdate event is emitted.  (See getSseEventEmitter()
     * and mitt documentation.)
     */
    connectToStream() {
        const url = `${apiSvc.getBaseUrl()}/sse`
        console.log(`sseClient connecting to url: ${url}`)
        sseSource = new EventSource(url)

        sseSource.addEventListener('dataUpdate', function(e) {
            const updateItem = JSON.parse(e.data)
            console.log(`Got dataUpdateEvent:  data=${updateItem}, emitting dataUpdate ...`)
            sseBus.emit('dataUpdate', updateItem)
        }, false)

        sseSource.addEventListener('open', function(/* e */) {
            console.log('SSE connection was opened')
        }, false)

        sseSource.addEventListener('close', function(/* e */) {
            console.log('SSE connection wants to close')
            sseSource.close()
        }, false)

        sseSource.addEventListener('error', function(e) {
            if (e.readyState === EventSource.CLOSED) {
                console.log('SSE connection was closed')
            }
            else {
                sseSource.close()
            }
        }, false)
    },

    /**
     * Close the connection to the server's SSE stream
     */
    closeStream() {
        if (sseSource)  sseSource.close()
    },

    /**
     * Return a reference to the event emitter.  When new SSE data arrives,
     * a 'dataUpdate' event is emitted with an UpdateItem payload.
     * @return {Emitter}
     */
    getSseEventEmitter() { return sseBus }
}

export default sseClient
