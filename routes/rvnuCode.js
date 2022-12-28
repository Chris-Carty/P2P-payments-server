import express from 'express'
import { getUserRvnuExpiry, generateRvnuCode } from '../controllers/rvnuCode.js'

const router = express.Router()

router.post('/generate/:accountId', generateRvnuCode)
router.get('/getPayerRvnuExpiry/:rvnuCodeId', getUserRvnuExpiry)

export default router
