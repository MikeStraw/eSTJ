import jwt from 'jsonwebtoken'
const TOKEN_KEY = 'access_token'

/**
 * Manage how Access Tokens are being stored and retrieved from storage.
 *
 * Current implementation stores to localStorage. Local Storage should always be
 * accessed through this instance.
 **/
const TokenService = {
    decodeToken(token) {
        return jwt.decode(token)
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY)
    },

    saveToken(accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken)
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY)
    }
}

export default TokenService
