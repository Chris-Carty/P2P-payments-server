import express from 'express'
import { getProviders } from '../controllers/tl_providers.js'

const router = express.Router()

router.post('/getProviders', getProviders)

export default router