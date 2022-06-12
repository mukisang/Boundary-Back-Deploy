import mongoose from 'mongoose'
import crypto from 'crypto'
import {setting} from '../config.js'
const Schema = mongoose.Schema


//made new user
const User = new Schema({
    nickname : { type : String, unique : true},
    email : { type : String, required: true, unique : true, lowercase: true},
    password : { type : String, required : true },
    profileImage : String,
});

//create new user
User.statics.create = function (nickname, email, password, profileImage){
    const encrypted = crypto.createHmac('sha1', setting.secret).update(password).digest('base64')
    const user = new this({
        nickname,
        email,
        password : encrypted,
        profileImage,
    })
    return user.save()
}

User.methods.verify = function(password) {
    const encrypted = crypto.createHmac('sha1', setting.secret).update(password).digest('base64')
    return this.password === encrypted
}

//find one by nickname or email
User.statics.findOneByNicknameEmail = function(nickname, email){
    return this.findOne({$or : [{"nickname" : nickname}, {"email" : email}]
    }).exec()
}

//find one by nickname or email
User.statics.findOneByEmail = function(email){
    return this.findOne({
        email
    }).exec()
}

//find one by nickname or email
User.statics.findOneByNickname = function(nickname){
    return this.findOne({
        nickname
    }).exec()
}

User.statics.findOneAndReplaceImage = function(user, profileImage){
    this.findOneAndUpdate({ email : user.email },
        {$set : { profileImage : profileImage }},
        {returnNewDocument : true}).exec()
    user.profileImage = profileImage
    return user
}

User.statics.findOneAndReplaceNickname = function(user, nickname){
    this.findOneAndUpdate({ email : user.email },
        {$set : { nickname : nickname }},
        {returnNewDocument : true}).exec()
    user.nickname = nickname
    return user
}


// module.exports = mongoose.model('User', User)
export default mongoose.model('User', User)
