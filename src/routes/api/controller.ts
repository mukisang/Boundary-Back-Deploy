//server IP
import {setting} from '../../config.js'
const staticPath = setting.staticPath

const simpleSuccessRespond = (response) =>{
    response.json({
        header : {
            message : "success"
        },
    })
}

const onError = (status, response, error) => {
    response.status(status).json({
        message: error.message
    })
}

const successRespondUser = (user, response) =>{
    response.json({
        header : {
            message : "success"
        },
        body : {
            email : user.email,
            nickname : user.nickname,
            profileImage : staticPath + user.profileImage
        },
    })
}

export {simpleSuccessRespond, onError, successRespondUser};
