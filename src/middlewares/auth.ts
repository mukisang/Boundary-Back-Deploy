import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import {setting} from '../config.js'


const authMiddleware = (request, response, next) => {
    //create a promise that decodes the token
    const verifySession = (sessionKey)=>{ 
        return new Promise(
            (resolve, reject)=>{
                jwt.verify(sessionKey, request.app.get('jwt-secret'), (err, decoded) => {
                    if(err) reject(err)
                    resolve(decoded)
                })
            }
        )
    }

    const regenerateSession = (decoded) => {
        return new Promise(
            (resolve, reject)=>{
                jwt.sign(
                    {
                        email : decoded.email
                    },
                    setting.secret,
                    {
                        expiresIn: '1d',
                        issuer: 'boundary.com',
                        subject: 'userInfo'
                    }, (err, token) => {
                        if (err) reject(err)
                        resolve(token)
                    })
        })
    }

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
            response.status(500).json({
                success : false,
                message : error.message
            })

    }


    //do process
    (async function process() {
        try{
            //check cookie
            if(!(request.session.key))
            {
                return response.status(401).json({
                    success : false,
                    message : 'Session Key does not exist'
                })
            }
            // const token = request.headers.cookie.split('=')[1]
            let decoded = await verifySession(request.session.key)
            let newSession = await regenerateSession(decoded)
            request.session.key = newSession
            request.decoded = decoded
            next()
        } catch(err){
            onError(err)
        }
    })()

}

export {authMiddleware};