import mongoose from 'mongoose'
import crypto from 'crypto'
import {setting} from '../config.js'
import User from './user.js'


interface IRoom {
    title: string;
    location: any;
    generator: any;
}

interface IRoomDocument extends IRoom, mongoose.Document {
    create: (title: string, latitude: string, longitude: string, generator: any) => Promise<IRoom>;

}


interface IRoomModel extends mongoose.Model<IRoomDocument> {
    searching(latitude: string, longitude: string, skip: number, PAGECNT: number): Promise<IRoom[]>;
    findOneByEmail(email: string): Promise<IRoom>;
    delete(room: any): Promise<IRoom>;

}

//made Room
const RoomSchema = new mongoose.Schema({
    id : { type : String, unique : true },
    title : { type : String, required : true },
    location : {
      type : { type : String},
      coordinates: []
    },
    generator : { type : mongoose.Schema.Types.ObjectId, ref: User, unique : true}
});

RoomSchema.index({ location: "2dsphere"})




//create new user
RoomSchema.statics.create = function (title, latitude, longitude, generator){
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

RoomSchema.statics.searching = function (latitude, longitude, skip, PAGECNT){
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
RoomSchema.statics.findOneByEmail = function (email) {
    const encrypted = encodeURIComponent(crypto.createHmac('sha1', setting.secret).update(email).digest('base64'))
    return this.findOne({id : encrypted}).exec()
}

RoomSchema.statics.delete = function (room){
    // return this.deleteOne({id : room.id}).exec()
    this.deleteOne({id : room.id}).exec()
}

const Room = mongoose.model<IRoomDocument, IRoomModel>('Room', RoomSchema)
export default Room;