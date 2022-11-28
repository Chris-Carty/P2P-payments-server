import express from 'express'
import { sendPaymentStatus } from '../controllers/webhooks.js'

const router = express.Router()

// TODO UPDATE PARAMS
router.post('/updatePaymentStatus/:phoneNumber', sendPaymentStatus)

export default router
