import express from 'express';
import {signUp, signIn, view, editNickname, signOut, editProfile} from './userController.js';
import {createChatRoom, searchChatRoom, checkChatRoom, deleteChatRoom} from './roomController.js';
import {authMiddleware} from '../../middlewares/auth.js';
import {uploadOption} from './storage.js';
const router = express.Router()



router.post('/signUp', signUp)
router.post('/signIn', signIn)


router.use('/user', authMiddleware)
router.get('/user', view)
router.get('/user/:email', view)
router.put('/user',editNickname)
router.post('/user/signOut',signOut)

router.use('/profile', authMiddleware)
router.put('/profile',uploadOption.single('file'), editProfile)


router.use('/chatroom', authMiddleware)
router.post('/chatroom', createChatRoom)
router.get('/chatroom', searchChatRoom)
router.get('/chatroom/check', checkChatRoom)
router.delete('/chatroom', deleteChatRoom)

export default router
