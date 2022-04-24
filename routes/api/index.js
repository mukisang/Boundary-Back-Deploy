const router = require('express').Router()
const controller = require('./controller')
const authMiddleware = require('../../middlewares/auth')
const multer = require('multer')

//for multer
const storage = multer.diskStorage({
    destination(request, file, cb) {
        cb(null, 'profiles/')
    },
    filename: (req, file, cb) => {
        var filetype = '';
        if (file.mimetype === 'image/gif') {
            filetype = 'gif';
        }
        if (file.mimetype === 'image/png') {
            filetype = 'png';
        }
        if (file.mimetype === 'image/jpeg') {
            filetype = 'jpg';
        }
        cb(null, 'image-' + Date.now() + '.' + filetype);
    }

})
const upload = multer({storage: storage})


router.post('/signUp', controller.signUp)
router.post('/signIn', controller.signIn)


router.use('/user', authMiddleware)
router.get('/user', controller.view)
router.get('/user/:email', controller.view)
router.put('/user',controller.editNickname)


router.use('/profile', authMiddleware)
router.put('/profile',upload.single('file'),controller.editProfile)


router.use('/chatroom', authMiddleware)
router.post('/chatroom', controller.createChatRoom)
router.get('/chatroom', controller.searchChatRoom)
router.get('/chatroom/check', controller.checkChatRoom)
router.delete('/chatroom', controller.deleteChatRoom)


module.exports = router