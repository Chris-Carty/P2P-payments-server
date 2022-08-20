import express from 'express'
import { getAccessToken, 
         initiatePayment, 
         storeTransaction,
         getPaymentStatus,
        } from '../controllers/tl_payment.js'
import cors from 'cors'
const router = express.Router()

const corsOptions = {
        origin: "https://thankful-moss-098c7a710.1.azurestaticapps.net"
}

router.post('/getAccessToken', getAccessToken)
router.post('/initiate/:accessToken', cors(corsOptions), initiatePayment)
router.post('/storeTransaction/:transactionID/:merchantID/:accountID/:rvnuCodeID/:currency/:amount', storeTransaction)
router.get('/status/:paymentId', getPaymentStatus)


export default router