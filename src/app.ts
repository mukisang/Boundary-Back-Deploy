import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import router from "./routes/api/index.js"
// const router = require('./routes/api/index.js')
import {setting} from './config.js'
import session from 'express-session'
import sessionFileStore from 'session-file-store'
// const fileStore = require('session-file-store')(session);
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



//set the session
const option = {
    path: './session',
    reapInterval: 60 * 60 * 24, //쿠키 만료 시 자동으로 삭제하는 기능
}

let fileStore = sessionFileStore(session)

app.use(session({
    secret: setting.secret,
    resave: false,//기존 세션과 변경사항 없어도 저장 여부
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60,//1시간
    },
    store: new fileStore(option)
}))


//configure api router
app.use('/api', router)


//정적 파일(프로필 정보) 로드
// app.use('/static/', express.static(path.join((__dirname + 'static/profiles'))))

