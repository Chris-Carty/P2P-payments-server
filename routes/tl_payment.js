import express from 'express'
import { getAccessToken, 
         initiatePayment, 
         storeTransaction,
         getPaymentStatus,
        } from '../controllers/tl_payment.js'

const router = express.Router()

router.post('/getAccessToken', getAccessToken)
router.post('/initiate/:accessToken', initiatePayment)
router.post('/storeTransaction/:transactionID/:merchantID/:accountID/:rvnuCodeID/:currency/:amount', storeTransaction)
router.get('/status/:paymentId', getPaymentStatus)


export default router