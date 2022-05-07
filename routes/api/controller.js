const jwt = require('jsonwebtoken')
const User = require('../../models/user')
const Room = require('../../models/room')
const fs = require('fs')
//server IP
const config = require('../../config')
const serverIP = config.serverName

exports.signUp = (request, response) => {
    const { nickname, email, password } = request.body

    //create user if not exist
    const create = (user) => {
        if(user) {
            if(user.nickname == nickname)
                throw new Error('nickname exists')
            else if(user.email == email)
                throw new Error('email exists')
        } else {
            console.log("user creating...")
            return User.create(nickname, email, password, "NULL")
        }
    }
    const respond = () =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : email,
                nickname : nickname,
                profileImage : "NULL"
            }
        })
    }
    const onError = (error) => {
        response.status(409).json({
            message: error.message
        })
    }

    //check nickname duplication
    User.findOneByNicknameEmail(nickname, email)
        .then(create)
        .then(respond)
        .catch(onError)

}

exports.signIn = (request, response) =>{
    const {email, password} = request.body
    const secret = request.app.get('jwt-secret')

    //check the user info & generate the jwt
    const check = (user) => {
        if (!user) {
            //user does not exist
            throw new Error('login failed')
        } else {
            if (user.verify(password)) {
                const p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            email : user.email
                        },
                        secret,
                        {
                            expiresIn: '7d',
                            issuer: 'boundary.com',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve([token, user])
                        })
                })
                return p
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
                profileImage : serverIP + user.profileImage
            },
            token : token,
        })
    }

    //error occured
    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    //find the user
    User.findOneByEmail(email)
        .then(check)
        .then(([token, user]) => respond(token, user))
        .catch(onError)
}

exports.check = (request, response) => {
    response.json({
        success: true,
        info : request.decoded
    })
}

exports.view = (request, response) => {
    const userE = request.params.email ? request.params.email : request.decoded['email']
    const check = (user) => {
        if (!user) {
            //user does not exist
            throw new Error('No matching email')
        }
        return user
    }

    const respond = (user) =>{
        //console.log(userE)
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : user.email,
                nickname : user.nickname,
                profileImage : serverIP + user.profileImage
            },
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    User.findOneByEmail(userE)
        .then(check)
        .then(respond)
        .catch(onError)


}

exports.editProfile = (request, response) => {
    const check = (user) => {
        return new Promise(function (resolve){
            if (!request.file) {
                //user does not exist
                throw new Error('No file')
            }
            if (user.profileImage)
            {
                fs.unlink(__dirname + "/../../profiles/" + user.profileImage, (err) =>{
                    if(err){
                        console.log("no existing profile match with fs")
                        //throw new Error('while deleting profiles error')
                    }
                })
            }
            resolve([user, request.file.filename])
        })
    }

    const respond = (user) =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : user.email,
                nickname : user.nickname,
                profileImage : serverIP + user.profileImage
            },
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }
    User.findOneByEmail(request.decoded["email"])
        .then(check)
        .then(([user, profileImage]) => User.findOneAndReplaceImage(user, profileImage))
        .then(respond)
        .catch(onError)

}

exports.editNickname = (request, response) => {
    const {nickname} = request.body
    const check = (user) => {
        return new Promise(function (resolve, reject){
            if (!user) {
                //user does not exist
                throw new Error('No user')
            }
            resolve([user, nickname])
        })
    }

    const respond = (user) =>{
        response.json({
            header : {
                message : "success"
            },
            body : {
                email : user.email,
                nickname : user.nickname,
                profileImage : serverIP + user.profileImage
            },
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    User.findOneByEmail(request.decoded["email"])
        .then(check)
        .then(([user, nickname]) => User.findOneAndReplaceNickname(user, nickname))
        .then(respond)
        .catch(onError)

}

//Create Chat Room
exports.createChatRoom = (request, response) => {
    const { title, latitude,  longitude} = request.body
    const user = User.findOneByEmail(request.decoded["email"])

    //create user if not exist
    const create = (user) => {
        return Room.create(title, latitude, longitude, user)
    }

    const checkRoom = (room) => {
        return new Promise(function (resolve, reject){
            if (room) {
                //user does not exist
                throw new Error('generator already has room ')
            }
            resolve(user)
        })
    }

    const respond = (room) =>{
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
                    email : room.generator.email,
                    nickname : room.generator.nickname,
                    profileImage : room.generator.profileImage
                }
            },
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    Room.findOneByEmail(request.decoded["email"])
        .then(checkRoom)
        .then((email) => create(email))
        .then((room) => respond(room))
        .catch(onError)
}

//Check Chat Room
exports.checkChatRoom = (request, response) => {
    const {email} = request.query
    const check = (room) => {
        if (!room){
            //room does not exist
            throw new Error('Has No Room')
        }
        return new Promise(function (resolve, reject){
            resolve(room)
        })
    }
    const respond = () =>{
        response.json({
            header : {
                message : "success"
            },
        })
    }
    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }


    Room.findOneByEmail(email)
        .then(check)
        .then(respond)
        .catch(onError)
}


//Search Chat Room
exports.searchChatRoom = (request, response) => {
    const {latitude, longitude} = request.query
    const check = (rooms) => {
        if (!rooms){
            //room does not exist
            throw new Error('Has No Matching Room')
        }
        return new Promise(function (resolve, reject){
            resolve(rooms)
        })
    }

    const search = (latitude, longitude) => {
        return Room.searching(latitude, longitude)
    }

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
                    profileImage : serverIP + room.generator.profileImage
                }
            })
        })
        //console.log(data)

        response.json({
            header : {
                message : "success"
            },
            body,
        })
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }


    search(latitude, longitude)
        .then(check)
        .then((rooms) => respond(rooms))
        .catch(onError)
}

//Delete Chat Room
exports.deleteChatRoom = (request, response) => {
    const {email} = request.query
    const check = (room) => {
        if (!room){
            //room does not exist
            throw new Error('Has No Room')
        }
        return new Promise(function (resolve, reject){
            resolve(room)
        })
    }
    const respond = () =>{
        response.json({
            header : {
                message : "success"
            },
        })
    }

    const deleting = (room) => {
        Room.delete(room)
    }

    const onError = (error) => {
        response.status(403).json({
            message: error.message
        })
    }

    Room.findOneByEmail(email)
        .then(check)
        .then(deleting)
        .then(respond)
        .catch(onError)

}
