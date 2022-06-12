import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import router from "./routes/api/index.js"
// const router = require('./routes/api/index.js')
import {setting} from './config.js'




// const express = require('express');
// const bodyParser = require('body-parser')
// const morgan = require('morgan')
// const mongoose = require('mongoose')
// const path = require('path')

//load the config
// const config = require('./config')
const PORT = process.env.PORT || setting.serverPort;



//express configuration
const app = express()

//open the server
app.listen(PORT, () => {
    console.log('Express is running on port', PORT)
})

//mongoose 버전업
mongoose.connect(setting.mongodbUri)
const db = mongoose.connection
db.on('error', console.error)
//db 연결 시작시 호출 함수
db.once('open', ()=>{
    console.log('connected to mongodb')
})


//POST body 파싱로직(중첩 객체 표현 허용 옵션)
app.use(bodyParser.json())

//print the request log on console
app.use(morgan('dev'))

//set the secret key variable for jwt
app.set('jwt-secret', setting.secret)

//configure api router
app.use('/api', router)


//정적 파일(프로필 정보) 로드
// app.use('/static/', express.static(path.join((__dirname + 'static/profiles'))))

