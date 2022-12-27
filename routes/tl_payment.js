import express from 'express'
import { getAccessToken, 
         storeTransaction,
         getPaymentStatus,
         validatePayment,
         initiatePaymentExistingUser,
         initiatePaymentNewUser
        } from '../controllers/tl_payment.js'

const router = express.Router()

router.post('/getAccessToken', getAccessToken)
router.post('/existingUser/:accessToken/:amount/:currency/:payerMobile/:payerAccountID/:reference', initiatePaymentExistingUser)
router.post('/newUser/:accessToken/:amount/:currency/:payerMobile/:payerName/:payerAccountID/:reference', initiatePaymentNewUser)
router.post('/storeTransaction/:transactionID/:merchantID/:payerAccountID/:recommenderID/:currency/:amount/:reference', storeTransaction)
router.get('/status/:accessToken/:paymentId', getPaymentStatus)
router.get('/validate/:clientId/:rvnuPaymentId', validatePayment)

export default router
