import * as fs from 'fs'
import User from '../../models/user.js'
//server IP
import {setting} from '../../config.js'
import {simpleSuccessRespond, onError, successRespondUser} from './controller.js'
import jwt from 'jsonwebtoken'
const staticPath = setting.staticPath


const signUp = (request, response) => {
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

const signIn = (request, response) =>{
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

const signOut = (request, response) =>{

    (async () => {
        try{
            response.cookie("token", "")
            simpleSuccessRespond(response)
        } catch(error){
            onError(403, response, error)
        }
    })()

}

const view = (request, response) => {

    (async () => {
        try{
            const userEmail = request.params.email ? request.params.email : request.decoded['email']
            let user = await User.findOneByEmail(userEmail)
            if(user)
                successRespondUser(user, response)
            else{
                let error = new Error()
                error.message = "no matching user"
                onError(406, response, error)
            }
        } catch(error){
            onError(500, response, error)
        }
    })()

}

const editProfile = (request, response) => {
    const checkFile = (user) => {
        return new Promise(function (resolve){
            if (!request.file) {
                //user does not exist
                throw new Error('No file')
            }
            if (user.profileImage != "NULL")
            {
                fs.unlink(staticPath + user.profileImage, (error) =>{
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

const editNickname = (request, response) => {


    (async () => {
        try{
            const {nickname} = request.body
            let user = await User.findOneByEmail(request.decoded["email"])
            await User.findOneAndReplaceNickname(user, nickname)
            successRespondUser(user, response)
        } catch(error){
            console.log(error)
            onError(500, response, error)
        }
    })()

}

export {signUp, signIn, view, editNickname, signOut, editProfile};