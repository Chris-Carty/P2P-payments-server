//https://www.twilio.com/docs/
import conn from '../config/dbConfig.js'
import dotenv from 'dotenv'
import twilio from 'twilio' 

// Load environment variables into process.env
dotenv.config({ path: '../.env' });

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
      });

}

// Send new RVNU code to user via SMS.
export const sendUsernameExpiry = async (req, res) => {

  const payerFirstname = req.params.payerFirstname
  const payerUsername = req.params.payerUsername
  const payerNumber = req.params.payerNumber
  const usernameExpiryDate = req.params.usernameExpiryDate

  const message = `Hey ${payerFirstname}!\u{1F44B}\n\nThanks for paying with RVNU.\n\nYour RVNU username @${payerUsername} expires on: ${usernameExpiryDate}\n\nShare and start earning now \u{1F911}\n\nPAY SHARE EARN`

  client.messages
      .create({body: message, messagingServiceSid: 'MGfbd328355eee7d0358a4a2fcebd5d3e9', to: payerNumber})
      .then(message => console.log(message.sid));

}

// Send commission text to user whose code has been used
export const sendCommissionSms = async (req, res) => {

  // Gets the commission earned by user who's RVNU code was used
  const paymentId = req.params.paymentId
  const recommenderName = req.params.recommenderName
  const recommenderNumber = req.params.recommenderNumber
  const payerName = req.params.payerName
  const payerUsername = req.params.payerUsername
  const merchantName = req.params.merchantName


  const query = `SELECT RecommenderCommission FROM RvnuTransaction WHERE PaymentID='${paymentId}'`

  try {

    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })

      Object.keys(data).forEach(function(key) {
        var row = data[key];
        const commission = row.RecommenderCommission

        if (commission) {
          // Send SMS to user notifying them how much they have earned
          const message = `Hey ${recommenderName}!\u{1F44B}\n\n${payerName} (@${payerUsername}) entered your username to pay with RVNU.\n\nYou've earned £${commission.toString()} \u{1F911}\n\n${merchantName} sends a huge thank you.\n\nKeep Sharing your RVNU username to continue earning.\n\nPAY SHARE EARN`
        
          client.messages
                  .create({body: message, messagingServiceSid: 'MGfbd328355eee7d0358a4a2fcebd5d3e9', to: recommenderNumber})
                  .then(message => console.log(message.sid));
        }

      });
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}




