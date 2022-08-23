import express from 'express'
import { sendOtp,
         verifyOtp, 
         sendNewRvnuCode, 
         sendCommissionSms
        } from '../controllers/twilioVerify.js'

const router = express.Router()

router.post('/sendOtp/:phoneNumber', sendOtp)
router.post('/verifyOtp/:otp/:phoneNumber', verifyOtp)
router.post('/sendRvnuCode/:userRvnuCode/:firstName/:phoneNum/:expiryDate', sendNewRvnuCode)
router.post('/commissionSms/:paymentId/:rvnuCodeId/:firstName/:mobileNumber/:email/:codeUsedBy', sendCommissionSms)

export default router
