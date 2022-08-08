import express from 'express'
import { getMerchantRvnuAccount } from '../controllers/rvnuMerchant.js'

const router = express.Router()

router.get('/getMerchantAccount/:merchantId', getMerchantRvnuAccount)

export default router