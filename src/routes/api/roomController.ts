import User from '../../models/user.js'
import Room from '../../models/room.js'
import {simpleSuccessRespond, onError} from './controller.js'
import {setting} from '../../config.js'

//server IP
const staticPath = setting.staticPath

const PAGECNT = 5


//Create Chat Room
const createChatRoom = (request, response) => {
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
            let newRoom = await Room.create(title, latitude, longitude, user)
            respond(newRoom, user)
        } catch(error){
            onError(400, response, error)
        }
    })()

}

//Check user has Chat Room
const checkChatRoom = (request, response) => {

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
const searchChatRoom = (request, response) => {
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
            let skip = 0
            if (page){
                skip = page * PAGECNT
            }
            else{
                skip = 0
            }
            let rooms = await Room.searching(latitude, longitude, skip, PAGECNT)
            respond(rooms)
        } catch(error){
            onError(400, response, error)
        }
    })()

}

//Delete Chat Room
const deleteChatRoom = (request, response) => {
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

export {createChatRoom, searchChatRoom, checkChatRoom, deleteChatRoom}