import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import twilioVerify from './routes/twilioVerify.js'
import payment from './routes/tl_payment.js'
import payout from './routes/tl_payout.js'
import rvnu from './routes/rvnuCode.js'
import user from './routes/rvnuUser.js'
import providers from './routes/tl_providers.js'
import webhooks from './routes/webhooks.js'
import tl_webhooks from './routes/tl_webhooks.js'
import session from './routes/rvnuSession.js'

const app = express()
const port = process.env.PORT || 8080;
app.use(express.json())
app.use(cors())

app.use('/verify', twilioVerify)
app.use('/payment', payment)
app.use('/payout', payout)
app.use('/rvnu', rvnu)
app.use('/providers', providers)
app.use('/user', user)
app.use('/event', webhooks)
app.use('/notifications', tl_webhooks)
app.use('/session', session)


app.get('/', (req, res) => {
    res.json("welcome to RVNU")
})


app.listen(port, () => {
  console.log(`RVNU server listening on port ${port}`)
})