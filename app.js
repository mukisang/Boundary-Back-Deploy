//load the dependencies
const express = require('express');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const path = require('path')

//load the config
const config = require('./config')
const PORT = process.env.PORT || config.serverPort;



//express configuration
const app = express()

//parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//print the request log on console
app.use(morgan('dev'))

//set the secret key variable for jwt
app.set('jwt-secret', config.secret)

//index page, just for testing
app.get('/', (request, response) => {
    response.send('Hello JWT')
})

//configure api router
app.use('/', require('./routes/api'))

//open the server
app.listen(PORT, () => {
    console.log('Express is running on port', PORT)
})

//connect to mongoDB
mongoose.connect(config.mongodbUri, {useNewUrlParser : true, useUnifiedTopology : true, useCreateIndex : true, useFindAndModify : false})
const db = mongoose.connection
db.on('error', console.error)
db.once('open', ()=>{
    console.log('connected to mongodb')
})

app.use(express.static(path.join((__dirname, 'profiles'))))

