//https://www.twilio.com/docs/
import mssql from 'mssql'
import config from '../config/dbConfig.js'
import dotenv from 'dotenv'
import twilio from 'twilio' 

const { connect, query } = mssql

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_TOKEN
const serviceID = process.env.SERVICE_ID

const client = twilio(accountSid, authToken);

// Sends OTP to users mobile number
export const sendOtp = async (req, res) => {

  const phoneNum = req.params.phoneNumber

  client.verify.services(serviceID)
  .verifications
  // TO DO: MAKE SMS SENDER NAME OF COMPANY
  .create({to: phoneNum, channel: 'sms'})
  .then((verification) => {
    res.status(200).json({verification})
  })
  .catch(error => {
    res.status(400).json({error})
  });

}


// Verifies OTP entered by the user
export const verifyOtp = async (req, res) => {

  const phoneNum = req.params.phoneNumber
  const otp = req.params.inputOtp

  client.verify.services(serviceID)
  .verificationChecks
  .create({to: phoneNum, code: otp})
  .then(verification_check => {
    res.status(200).json({ verification_check })
  })
  .catch(error => {
    res.status(404).json({ error })
    console.log(error)
  });

}

// Send new RVNU code to user via SMS.
export const sendNewRvnuCode = async (req, res) => {

  const firstName = req.params.firstName
  const phoneNum = req.params.phoneNum
  const expiryDate = req.params.expiryDate

  const message = `Hey ${firstName}!\n\nYour RVNU Username @${username} has been revalidated for another 14 days.\n\nShare and start earning!\n\nExpires: ${expiryDate}`

  client.messages
      .create({body: message, messagingServiceSid: 'MGfbd328355eee7d0358a4a2fcebd5d3e9', to: phoneNum})
      .then(message => console.log(message.sid));

}

// Send commission text to user whose code has been used
export const sendCommissionSms = async (req, res) => {
  // Gets the commission earned by user who's RVNU code was used
  const paymentId = req.params.paymentId
  const rvnuCodeId = req.params.rvnuCodeId
  const firstName = req.params.firstName
  const mobileNumber = req.params.mobileNumber
  const codeUsedBy = req.params.codeUsedBy
  const merchantName = req.params.merchantName

  try {

    await connect(config)
    const result = await query`SELECT UserCommission FROM RvnuTransaction WHERE PaymentID = ${paymentId} AND RvnuCodeID = ${rvnuCodeId}`

    const userCommissionEarned = result.recordset[0].UserCommission

    // Send SMS to user notifying them how much they have earned
    const message = `Hey ${firstName}!\n\n${codeUsedBy} just used your RVNUcode at ${merchantName}\n\nYou've earned £${userCommissionEarned.toString()}!`
  
    client.messages
            .create({body: message, messagingServiceSid: 'MGfbd328355eee7d0358a4a2fcebd5d3e9', to: mobileNumber})
            .then(message => console.log(message.sid));
    
  } catch (err) {

    res.status(409).send({ message: err.message })
    
  }

}
