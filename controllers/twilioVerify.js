//https://www.twilio.com/docs/
import dotenv from 'dotenv'
import twilio from 'twilio' 
import connection from '../config/dbConfig.js'

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const serviceID = process.env.SERVICE_ID

const client = twilio(accountSid, authToken);

// Sends Otp to users mobile number
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

// Verifies Otp entered by the user
export const verifyOtp = async (req, res) => {

  const phoneNum = req.params.phoneNumber
  const otp = req.params.otp

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

  const rvnuCode = req.params.userRvnuCode
  const firstName = req.params.firstName
  const phoneNum = req.params.phoneNum
  const expiryDate = req.params.expiryDate

  const message = `Hey ${firstName}!\n\nHere's your RVNUcode: ${rvnuCode}\n\nShare and start earning!\n\nExpires: ${expiryDate}`

  client.messages
      .create({body: message, from: '+12058467345', to: phoneNum})
      .then(message => console.log(message.sid));

}

export const sendCommissionSms = async (req, res) => {
  // Gets the commission earned by user who's RVNU code was used
  const paymentId = req.params.paymentId
  const rvnuCodeId = req.params.rvnuCodeId
  const firstName = req.params.firstName
  const mobileNumber = req.params.mobileNumber
  const codeUsedBy = req.params.codeUsedBy

  const query1 = "SELECT UserCommission FROM RvnuTransaction WHERE PaymentID ='"+ paymentId +"' AND RvnuCodeID ='"+ rvnuCodeId +"' LIMIT 1"

  try {
    connection.query(query1, (err, rows) => {
      if(err) return res.status(409).send({ message: err.message })

      const count = rows.length;

      if (count) {

        const userCommissionEarned = rows.map(i => i.UserCommission)[0];

        // Send SMS to user notifying them how much they have earned
        const message = `Hey ${firstName}!\n\n${codeUsedBy} just used your RVNUcode\n\nYou've earned £${userCommissionEarned.toString()}!`

        client.messages
            .create({body: message, from: '+12058467345', to: mobileNumber})
            .then(message => console.log(message.sid));


      } else {
        console.log('error: could not get user commission');
      }

    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}
