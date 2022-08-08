import express from 'express'
import { verifyRvnuCode, getUserRvnuCode, generateRvnuCode } from '../controllers/rvnuCode.js'

const router = express.Router()

router.post('/generate/:userId', generateRvnuCode)
router.post('/code/:rvnuCode', verifyRvnuCode)
router.get('/getUserCode/:rvnuCodeId', getUserRvnuCode)

export default router