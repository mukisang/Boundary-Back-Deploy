import mongoose from 'mongoose';
import crypto from 'crypto'
import {setting} from '../config.js'


interface IUser {
    nickname: string;
    email: string;
    password: string;
    profileImage: string;
}
interface IUserDocument extends IUser, Document {
    create(nickname: string, email: string, password: string, profileImage: string): Promise<IUser>;
    verify(password: string): boolean;
}

interface IUserModel extends mongoose.Model<IUserDocument> {
    findOneByEmail(email: string): Promise<IUserDocument>;
    findOneByNickname(nickname: string): Promise<IUserDocument>;
    findOneAndReplaceImage(user: any, profileImage: string): Promise<IUser>;
    findOneAndReplaceNickname(user: any, nickname: string): Promise<IUser>;
}   

//made new user
const UserSchema: mongoose.Schema<IUserDocument> = new mongoose.Schema({
    nickname : { type : String, unique : true},
    email : { type : String, required: true, unique : true, lowercase: true},
    password : { type : String, required : true },
    profileImage : String,
});


UserSchema.methods.verify = function(password: string) {
    const encrypted = crypto.createHmac('sha1', setting.secret).update(password).digest('base64')
    return this.password === encrypted
}

//create new user
UserSchema.statics.create = function (nickname: string, email: string, password: string, profileImage: string){
    const encrypted = crypto.createHmac('sha1', setting.secret).update(password).digest('base64')
    const user = new this({
        nickname,
        email,
        password : encrypted,
        profileImage,
    })
    return user.save()
}


//find one by nickname or email
UserSchema.statics.findOneByNicknameEmail = function(nickname: string, email: string){
    return this.findOne({$or : [{"nickname" : nickname}, {"email" : email}]
    }).exec()
}

//find one by nickname or email
UserSchema.statics.findOneByEmail = function(email: string){
    return this.findOne({
        email
    }).exec()
}

//find one by nickname or email
UserSchema.statics.findOneByNickname = function(nickname: string){
    return this.findOne({
        nickname
    }).exec()
}

UserSchema.statics.findOneAndReplaceImage = function(user: any, profileImage: string){
    this.findOneAndUpdate({ email : user.email },
        {$set : { profileImage : profileImage }},
        {returnNewDocument : true}).exec()
    user.profileImage = profileImage
    return user
}

UserSchema.statics.findOneAndReplaceNickname = function(user: any, nickname: string){
    this.findOneAndUpdate({ email : user.email },
        {$set : { nickname : nickname }},
        {returnNewDocument : true}).exec()
    user.nickname = nickname
    return user
}


const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
export default User;
