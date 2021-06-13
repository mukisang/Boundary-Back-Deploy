const jwt = require('jsonwebtoken')

const authMiddleware = (request, response, next) => {

    if(!(request.headers.cookie))
    {
        return response.status(401).json({
            success : false,
            message : 'token does not exist'
        })
    }
    //read token from Auth
    const token = request.headers.cookie.split('=')[1]

    //create a promise that decodes the token
    const p = new Promise(
        (resolve, reject)=>{
            jwt.verify(token, request.app.get('jwt-secret'), (err, decoded) => {
                if(err) reject(err)
                resolve(decoded)
            })
        }
    )

    //if failed to verify, return error message
    const onError = (error) => {
        if(error == "JsonWebTokenError: invalid signature")
            response.status(401).json({
                success : false,
                message : error.message
            })
        else if(error == "TokenExpiredError: jwt expired")
            response.status(403).json({
                success : false,
                message : error.message
            })
        else
            response.status(401).json({
                success : false,
                message : error.message
            })


    }

    //preocess the promise
    p.then((decoded) => {
        request.decoded = decoded
        next()
    }).catch(onError)
}

module.exports = authMiddleware