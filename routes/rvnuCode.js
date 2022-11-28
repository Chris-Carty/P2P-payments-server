import express from 'express'
import { getUserRvnuExpiry, generateRvnuCode,          getRecommenderRvnuCode } from '../controllers/rvnuCode.js'

const router = express.Router()

router.post('/generate/:accountId', generateRvnuCode)
router.get('/getPayerRvnuExpiry/:rvnuCodeId', getUserRvnuExpiry)
router.get('/recommender/:username', getRecommenderRvnuCode)

export default router
