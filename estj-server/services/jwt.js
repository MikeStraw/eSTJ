const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')

const OPT_ALGORITHM = 'HS256'
const OPT_EXPIRES = '3h'
const OPT_ISSUER  = 'eSTJ-Server'
const SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET : 'stj-server-blah-blah-blah'

const jwtOptions =  {'secret': SECRET, 'expiresIn': OPT_EXPIRES}
const jwtInstance = jwt(jwtOptions)

const signVerifyOptions = {
    algorithm:  OPT_ALGORITHM,
    expiresIn:  OPT_EXPIRES,
    issuer:     OPT_ISSUER
}

function JWTErrorHandler(ctx, next) {
    return next().catch((err) => {
        if (401 === err.status) {
            ctx.status = 401
            ctx.body = {
                'error': 'Not authorized'
            }
        } else {
            throw err
        }
    })
}

module.exports = {
    jwt: ()               => { return jwtInstance },
    decode: (token)       => { return jsonwebtoken.decode(token, {complete: true})},
    errorHandler: ()      => { return JWTErrorHandler },
    issueToken: (payload) => { return jsonwebtoken.sign(payload, SECRET, signVerifyOptions) }
}
