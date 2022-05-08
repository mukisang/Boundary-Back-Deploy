const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const Room = require('../../models/room')
const fs = require('fs')
//server IP
const config = require('../../config')
const staticPath = config.staticPath


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

exports.signUp = (request, response) => {
    const { nickname, email, password } = request.body

    //create user if not exist
    const create = () => {
        console.log("user creating...")
        return User.create(nickname, email, password, "NULL")
        
    }

    const respond = () =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : email,
                nickname : nickname,
                profileImage : "null"
            }
        })
    }
    

    (async () => {
        try{
            await create()
            respond()
        } catch(error){
            if(error.code == 11000){
                error.message = "nickname/email already exists"
                onError(409, response, error)
            }
            else
                onError(500, response, error)
        }
    })()

}

exports.signIn = (request, response) =>{
    const {email, password} = request.body
    const secret = request.app.get('jwt-secret')

    //check the user info & generate the jwt
    const checkAndGenerateToken = (user) => {
        if (!user) {
            //user does not exist
            throw new Error('login failed')
        } else {
            if (user.verify(password)) {
                return new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            email : user.email
                        },
                        secret,
                        {
                            expiresIn: '1h',
                            issuer: 'boundary.com',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token)
                        })
                })
            } else {
                throw new Error('login failed')
            }
        }
    }


    const respond = (token, user) =>{
        response.cookie('token', token)
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : email,
                nickname : user.nickname,
                profileImage : staticPath + user.profileImage
            },
            token : token,
        })
    }


    (async () => {
        try{
            let user = await User.findOneByEmail(email)
            //암호화 로직 비동기처리
            let token = await checkAndGenerateToken(user)
            respond(token, user)
        } catch(error){
            onError(403, response, error)
        }
    })()

}


exports.view = (request, response) => {
    const userEmail = request.params.email ? request.params.email : request.decoded['email']

    (async () => {
        try{
            let user = await User.findOneByEmail(userEmail)
            if(user)
                successRespondUser(user, response)
            else{
                error = new Error()
                error.message = "no matching user"
                onError(406, response, error)
            }
        } catch(error){
            onError(500, response, error)
        }
    })()

}

exports.editProfile = (request, response) => {
    const checkFile = (user) => {
        return new Promise(function (resolve){
            if (!request.file) {
                //user does not exist
                throw new Error('No file')
            }
            if (user.profileImage != "NULL")
            {
                fs.unlink(__dirname + "/../../profiles/" + user.profileImage, (error) =>{
                    if(error){
                        console.log(error)
                        console.log("no existing profile match with fs")
                    }
                })
            }
            resolve(user)
        })
    }


    (async () => {
        try{
            let user = await User.findOneByEmail(request.decoded["email"])
            await checkFile(user)
            user = await User.findOneAndReplaceImage(user, request.file.filename)
            successRespondUser(user, response)
        } catch(error){
            console.log(error)
            onError(500, response, error)
        }
    })()


}

exports.editNickname = (request, response) => {
    const {nickname} = request.body


    (async () => {
        try{
            let user = await User.findOneByEmail(request.decoded["email"])
            await User.findOneAndReplaceNickname(user, nickname)
            successRespondUser(user, response)
        } catch(error){
            console.log(error)
            onError(500, response, error)
        }
    })()

}

//Create Chat Room
exports.createChatRoom = (request, response) => {
    const { title, latitude, longitude} = request.body
   
    const respond = (room, user) =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                id : room.id,
                title : room.title,
                location : {
                    latitude : parseFloat(room.location.coordinates[1]),
                    longitude : parseFloat(room.location.coordinates[0])
                },
                generator : {
                    email : user.email,
                    nickname : user.nickname,
                    profileImage : staticPath + user.profileImage
                }
            },
        })
    }

    (async () => {
        try{
            const email = request.decoded["email"]
            const user = await User.findOneByEmail(email)
            let room = await Room.findOneByEmail(email)
            if (room) {
                throw new Error("generator already has room")
            }
            room = await Room.create(title, latitude, longitude, user)
            respond(room, user)
        } catch(error){
            console.log(error)
            onError(400, response, error)
        }
    })()

}

//Check user has Chat Room
exports.checkChatRoom = (request, response) => {

    (async () => {
        try{
            const {email} = request.query
            let room = await Room.findOneByEmail(email)
            if (!room) {
                throw new Error("Has No Room")
            }
            simpleSuccessRespond(response)
        } catch(error){
            onError(400, response, error)
        }
    })()
}

//Search Chat Room
exports.searchChatRoom = (request, response) => {
    const respond = (rooms) =>{
        let body = []
        rooms.forEach(function (room){
            body.push({
                id : room.id,
                title : room.title,
                location : {
                    latitude : parseFloat(room.location.coordinates[1]),
                    longitude : parseFloat(room.location.coordinates[0])
                },
                generator : {
                    email : room.generator.email,
                    nickname : room.generator.nickname,
                    profileImage : staticPath + room.generator.profileImage
                }
            })
        })

        response.json({
            header : {
                message : "success"
            },
            body,
        })
    }


    (async () => {
        try{
            const {latitude, longitude} = request.query
            let rooms = await Room.searching(latitude, longitude)
            respond(rooms)
        } catch(error){
            onError(400, response, error)
        }
    })()

}

//Delete Chat Room
exports.deleteChatRoom = (request, response) => {
    (async () => {
        try{
            const {email} = request.query
            let room = await Room.findOneByEmail(email)
            if (!room){
                throw new Error('Has No Room')
            }
            await Room.delete(room)
            simpleSuccessRespond(response)
        } catch(error){
            onError(400, response, error)
        }
    })()

}
