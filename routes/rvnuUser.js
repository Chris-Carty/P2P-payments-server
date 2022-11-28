import express from 'express'
import { updateBankAccount,
         getUserBankAccount, 
         getUserRvnuAccount, 
         getName, 
         updateTotalAssets,
         createRvnuAccount,
         login,
         getRecommenderAccount
        } from '../controllers/rvnuUser.js'
//import verifyJWT from '../middleware/'

const router = express.Router()

router.post('/updateBankAccount/:userId/:providerId/:sortCode/:accountNum', updateBankAccount)
router.get('/getUserBankAccount/:userId', getUserBankAccount)
router.get('/getUserRvnuAccount/:num', getUserRvnuAccount)
router.get('/getName/:num', getName)
router.get('/updateAssets/:accountId/:paymentId', updateTotalAssets)
router.post('/register/:firstname/:lastname/:mobile/:email/:password/:providerId/:accountNum/:sortCode', createRvnuAccount)
router.get('/login/:email/:password/', login)
router.get('/recommender/account/:accountId', getRecommenderAccount)



export default router
