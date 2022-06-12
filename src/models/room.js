import mongoose from 'mongoose'
import crypto from 'crypto'
import {setting} from '../config.js'
import User from './user.js'
const Schema = mongoose.Schema



//made Room
const Room = new Schema({
    id : { type : String, unique : true },
    title : { type : String, required : true },
    location : {
      type : { type : String},
      coordinates: []
    },
    generator : { type : Schema.Types.ObjectId, ref: User, unique : true}
});

Room.index({ location: "2dsphere"})

//create new user
Room.statics.create = function (title, latitude, longitude, generator){
    //room id will encrypted by user.email
    const encrypted = encodeURIComponent(crypto.createHmac('sha1', setting.secret).update(generator.email).digest('base64'))
    const room = new this({
        id : encrypted,
        title : title,
        location : {
            type : "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        generator : generator,
    })
    room.save()
    // room.populate('generator', 'email nickname profileImage').execPopulate()
    return room
}

Room.statics.searching = function (latitude, longitude, skip, PAGECNT){
    const coordinates = [longitude, latitude]
    return this.find({
        location : {
            $near : {
                //1km : 1000
                $maxDistance : 1000000,
                $geometry : {
                    type : "Point",
                    coordinates : coordinates
                }
            }
        }
    },{_id : false}).skip(skip).limit(PAGECNT).populate('generator', 'email nickname profileImage',{_id : false})
}


//find one by nickname or email
Room.statics.findOneByEmail = function (email){
    const encrypted = encodeURIComponent(crypto.createHmac('sha1', setting.secret).update(email).digest('base64'))
    return this.findOne({id : encrypted}).exec()
}

Room.statics.delete = function (room){
    // return this.deleteOne({id : room.id}).exec()
    this.deleteOne({id : room.id}).exec()
}

// module.exports = mongoose.model('Room', Room)
export default mongoose.model('Room', Room)