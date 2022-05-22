const User = require('../../models/user')
const Room = require('../../models/room')
const controller = require('./controller')
//server IP
const config = require('../../config')
const staticPath = config.staticPath

const onError = controller.onError
const simpleSuccessRespond = controller.simpleSuccessRespond

const PAGECNT = 5


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
            const {latitude, longitude, page} = request.query
            skip = 0
            if (page){
                skip = page * PAGECNT
            }
            let rooms = await Room.searching(latitude, longitude, skip, PAGECNT)
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
