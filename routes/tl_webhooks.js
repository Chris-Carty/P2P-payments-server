import express from 'express'
import { handleEventNotification } from '../controllers/tl_webhooks.js'

const router = express.Router()

router.post('/webhook', handleEventNotification)

export default router