import express from 'express'
import { sendOtp,
         verifyOtp, 
         sendUsernameExpiry, 
         sendCommissionSms
        } from '../controllers/twilioVerify.js'

const router = express.Router()

router.post('/sendOtp/:phoneNumber', sendOtp)
router.post('/verifyOtp/:inputOtp/:phoneNumber', verifyOtp)
router.post('/sendExpiry/:payerFirstname/:payerUsername/:payerNumber/:usernameExpiryDate', sendUsernameExpiry)
router.post('/commissionSms/:paymentId/:recommenderName/:recommenderNumber/:payerName/:payerUsername/:merchantName', sendCommissionSms)

export default router
