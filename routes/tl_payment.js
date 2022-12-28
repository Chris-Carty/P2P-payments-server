import express from 'express'
import { generatePaymentLink, 
         validatePayment,
        } from '../controllers/tl_payment.js'

const router = express.Router()

router.post('/generatePaymentLink/:client_id/:payment_request_id/:sessionId', generatePaymentLink)
router.get('/validate/:clientId/:rvnuPaymentId', validatePayment)

export default router
