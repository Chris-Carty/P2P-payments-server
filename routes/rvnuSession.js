import express from 'express'
import { createSession, 
         validateSession,
         updateMobile,
         updateNewUser,
         updateVerified 
        } from '../controllers/rvnuSession.js'
const router = express.Router()

router.post('/create/:clientId/:accountId/:rvnuPaymentId', createSession)
router.get('/validate/:sessionId/:rvnuPaymentId', validateSession)
router.post('/mobile/:sessionId/:mobileNumber', updateMobile)
router.post('/newUser/:sessionId/:mobileNumber/:bool', updateNewUser)
router.post('/verified/:sessionId/:mobileNumber', updateVerified)

export default router