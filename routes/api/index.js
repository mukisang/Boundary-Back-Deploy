const router = require('express').Router()
const userController = require('./userController')
const roomController = require('./roomController')
const authMiddleware = require('../../middlewares/auth')
const upload = require('./storage').upload



router.post('/signUp', userController.signUp)
router.post('/signIn', userController.signIn)


router.use('/user', authMiddleware)
router.get('/user', userController.view)
router.get('/user/:email', userController.view)
router.put('/user',userController.editNickname)
router.post('/user/signOut',userController.signOut)

router.use('/profile', authMiddleware)
router.put('/profile',upload.single('file'), userController.editProfile)


router.use('/chatroom', authMiddleware)
router.post('/chatroom', roomController.createChatRoom)
router.get('/chatroom', roomController.searchChatRoom)
router.get('/chatroom/check', roomController.checkChatRoom)
router.delete('/chatroom', roomController.deleteChatRoom)


module.exports = router