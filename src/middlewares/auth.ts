import jwt from 'jsonwebtoken'


const authMiddleware = (request, response, next) => {
    //create a promise that decodes the token
    const verifyToken = (token)=>{ 
        return new Promise(
            (resolve, reject)=>{
                jwt.verify(token, request.app.get('jwt-secret'), (err, decoded) => {
                    if(err) reject(err)
                    resolve(decoded)
                })
            }
        )
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
            if(!(request.headers.cookie))
            {
                return response.status(401).json({
                    success : false,
                    message : 'token does not exist'
                })
            }
            const token = request.headers.cookie.split('=')[1]
            let decoded = await verifyToken(token)
            request.decoded = decoded
            next()
        } catch(err){
            onError(err)
        }
    })()

}

export {authMiddleware};