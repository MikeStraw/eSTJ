import axios from 'axios'

let apiVersion = '1.0'
let baseUrl = 'http://localhost:3000'

/**
 * Return the api-path part of the URL based on the interface version
 * @returns {string} the api-path without a leading or trailing /
 */
function getApiPath()
{
    if (apiVersion === '1.0') return 'api'
    return ''
}

/**
 * Get the full URL for a given path
 * @param {string} path - the path of the resource
 * @param {boolean} isApiCall - true if this is an API call
 * @returns {string} the full URL
 */
function getUrl(path, isApiCall = true)
{
    return isApiCall ? `${baseUrl}/${getApiPath()}/${path}` : `${baseUrl}/${path}`
}

axios.defaults.headers.common['Content-Type'] = 'application/json'

/**
 * This module performs the http calls to the estj-server
 */
const ApiService = {

    addAuthHeader: (token) => { axios.defaults.headers.common['Authorization'] = `Bearer ${token}` },
    removeAuthHeader: ()   => { delete axios.defaults.headers.common['Authorization'] },

    /**
     * Initialize the apiService module
     * @param {Object} API service options
     *                 hostUrl --> the URL of the host HTTP server (http://localhost:8080)
     *                 apiPort --> the port used by the API server
     *                 version --> the interface version
     */
    init: ( {hostUrl, apiPort, version} = {} ) => {
        if (version) apiVersion = version

        // Check to see if we are running from the Vue Dev server (port 8080)
        // If so, then use the apiPort from the incoming parameters
        if (hostUrl  &&  apiPort) {
            const url = new URL(hostUrl)
            if (url.port === '8080') {
                baseUrl = `${url.protocol}//${url.hostname}:${apiPort}`
            }
            else {
                baseUrl = `${url.protocol}//${url.host}`
            }
        }
        console.log(`apiSvc:init - baseUrl=${baseUrl}`)
    },

    getMeets: () => { return axios.get(getUrl('meets', true)) },

    login: (data) => { return axios.post(getUrl('login', false), data) }
}

Object.freeze(ApiService)
export default ApiService
