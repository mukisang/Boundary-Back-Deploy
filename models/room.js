const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto')
const User = require('./user')
const config = require('../config')


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
    const encrypted = encodeURIComponent(crypto.createHmac('sha1', config.secret).update(generator.email).digest('base64'))
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
    return room.populate('generator', 'email nickname profileImage').execPopulate()
}

Room.statics.searching = function (latitude, longitude){
    const coordinates = [longitude, latitude]
    return this.find({
        location : {
            $near : {
                //1km : 1000
                $maxDistance : 1000,
                $geometry : {
                    type : "Point",
                    coordinates : coordinates
                }
            }
        }
    },{_id : false}).populate('generator', 'email nickname profileImage',{_id : false})
}


//find one by nickname or email
Room.statics.findOneByEmail = function (email){
    const encrypted = encodeURIComponent(crypto.createHmac('sha1', config.secret).update(email).digest('base64'))
    return this.findOne({id : encrypted}).exec()
}

Room.statics.delete = function (room){
    return this.deleteOne({id : room.id}).exec()
}

module.exports = mongoose.model('Room', Room)
