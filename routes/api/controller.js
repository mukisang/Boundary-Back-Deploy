//server IP
const config = require('../../config')
const staticPath = config.staticPath

exports.simpleSuccessRespond = (response) =>{
    response.json({
        header : {
            message : "success"
        },
    })
}

exports.onError = (status, response, error) => {
    response.status(status).json({
        message: error.message
    })
}

exports.successRespondUser = (user, response) =>{
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
