const router = require('express').Router()
const controller = require('./controller')
const authMiddleware = require('../../middlewares/auth')
const upload = require('./storage').upload



router.post('/signUp', controller.signUp)
router.post('/signIn', controller.signIn)


router.use('/user', authMiddleware)
router.get('/user', controller.view)
router.get('/user/:email', controller.view)
router.put('/user',controller.editNickname)
router.post('/user/signOut',controller.signOut)

router.use('/profile', authMiddleware)
router.put('/profile',upload.single('file'), controller.editProfile)


router.use('/chatroom', authMiddleware)
router.post('/chatroom', controller.createChatRoom)
router.get('/chatroom', controller.searchChatRoom)
router.get('/chatroom/check', controller.checkChatRoom)
router.delete('/chatroom', controller.deleteChatRoom)


module.exports = router