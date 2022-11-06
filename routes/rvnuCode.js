import express from 'express'
import { getUserRvnuExpiry, generateRvnuCode } from '../controllers/rvnuCode.js'

const router = express.Router()

router.post('/generate/:userId', generateRvnuCode)
router.get('/getUserRvnuExpiry/:rvnuCodeId', getUserRvnuExpiry)

export default router
