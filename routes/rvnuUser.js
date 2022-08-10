import express from 'express'
import { updateBankAccount,
         getUserBankAccount, 
         getUserRvnuAccount, 
         getName, 
         getUserWhosCodeRvnuUsed ,
         updateTotalAssets,
         createRvnuAccount
        } from '../controllers/rvnuUser.js'

const router = express.Router()

router.post('/updateBankAccount/:userId/:providerId/:sortCode/:accountNum', updateBankAccount)
router.get('/getUserBankAccount/:userId', getUserBankAccount)
router.get('/getUserRvnuAccount/:num', getUserRvnuAccount)
router.get('/getName/:num', getName)
router.get('/userCodeUsed/:rvnuCodeId', getUserWhosCodeRvnuUsed )
router.get('/updateAssets/:accountId/:paymentId/:rvnuCodeId', updateTotalAssets)
router.post('/register/:firstname/:lastname/:mobile/:email/:password/:tlProviderId/:accountNum/:sortcode', createRvnuAccount)

export default router