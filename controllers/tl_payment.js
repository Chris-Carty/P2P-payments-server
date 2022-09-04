import dotenv from 'dotenv'
import axios from 'axios'
import mssql from 'mssql'
import config from '../config/dbConfig.js'

const { connect, query } = mssql

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

// Retrieve access token to enable payment initiation
export const getAccessToken = async (req, res) => {

  const options = {
    method: 'POST',
    url: 'https://auth.truelayer-sandbox.com/connect/token',
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'payments',
      grant_type: 'client_credentials'
    }
  };
  
  axios.request(options).then(response =>
    res.json(response.data.access_token)
  ).catch(function (error) {
    res.send({ message: error});
  });

}

// Store Transaction Information in Database
export const storeTransaction = async (req, res) => {

    const paymentID = req.params.transactionID
    const merchantID = req.params.merchantID
    const accountID = req.params.accountID
    const rvnuCodeID = req.params.rvnuCodeID
    const currency = req.params.currency
    const amount = req.params.amount
    const rvnuFee = (amount * 0.007)
    const rvnuFeeRounded = Math.round((rvnuFee + Number.EPSILON) * 100) / 100
    const reference = 'RVNU-TEST'

    try {
      await connect(config)
      // Get the % commission this merchant has agreed to pay
      const result = await query`SELECT CommissionPercentage FROM Merchant WHERE MerchantID=${merchantID}`
      

      if (result.recordset.length == 1) {

            const merchantCommissionRate =result.recordset[0].CommissionPercentage;
            // Calc commision for user who's code was used
            const userCommissionEarned  = amount * (merchantCommissionRate / 100)
            const userCommissionRounded = Math.round((userCommissionEarned + Number.EPSILON) * 100) / 100

            // Make a record of this transaction in the database
            try {
              await connect(config)
              const result = await query`INSERT INTO RvnuTransaction (PaymentID, MerchantID, AccountID, DateTime, Currency, TotalAmount, RvnuCodeID, RvnuFee, UserCommission, Reference) VALUES (${paymentID}, ${merchantID}, ${accountID}, CURRENT_TIMESTAMP, ${currency}, ${amount}, ${rvnuCodeID}, ${rvnuFeeRounded}, ${userCommissionRounded}, ${reference})`

              res.status(200).json("Successfully stored transaction");
    
            } catch (err) {
                res.status(409).send({ message: err.message })
            }

        } else {
          console.log('error: could not get merchant commission');
        }

    } catch (err) {
        res.status(409).send({ message: err.message })
    }

}

export const getPaymentStatus = async (req, res) => {
  // Gets users preferred payment account
  const paymentId = req.params.paymentId

  try {
    await connect(config)
    const result = await query`SELECT Status FROM RvnuTransaction WHERE PaymentID =${paymentId}`
    res.json(result.recordset).status(200)
  } catch (err) {
    res.status(409).send({ message: err.message })
  }

}
