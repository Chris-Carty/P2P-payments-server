import express from 'express'
import { getAccessToken, 
         storeTransaction,
         getPaymentStatus,
         initiatePayment,
        } from '../controllers/tl_payment.js'

const router = express.Router()

router.post('/getAccessToken', getAccessToken)
router.post('/initiate/:accessToken/:amount/:currency/:payerMobile/:payerName/:payerAccountID/:reference', initiatePayment)
router.post('/storeTransaction/:transactionID/:merchantID/:payerAccountID/:recommenderID/:currency/:amount/:reference', storeTransaction)
router.get('/status/:accessToken/:paymentId', getPaymentStatus)

export default router
