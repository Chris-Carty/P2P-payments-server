import dotenv from 'dotenv'
import axios from 'axios'
import { randomUUID } from 'crypto'
import * as tlSigning from 'truelayer-signing'
import conn from '../config/dbConfig.js'

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const kid = process.env.CERTIFICATE_ID
const privateKeyPem = process.env.PRIVATE_KEY

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

// Initiate Payment by calling TrueLayer '/payments' endpoint
export const initiatePayment = async (req, res) => {

  // Set random idempotencyKey
  const idempotencyKey = randomUUID();
  
  // Access Token
  const accessToken = req.params.accessToken

  /*
  // Required Merchant Information (Payee) 
  const merchantName = req.params.name
  const marchantSortCode = req.params.sortCode
  const marchantAccountNo = req.params.accountNo
  const paymentReferecne = req.params.id
  */

  /*
  // Payment Information (Payee) 
  const amount = req.params.amount
  const currency = req.params.currency
  */

  /*
  // Required User Information (Payee) 
  conse userId = req.params.userId
  const userName = req.params.userName
  const userPhone = req.params.userPhone
  */

  /*
  // User preferred Banking provider
  const provider_id = ""
  */

  // Request body - for preselected bank (i.e if user already has RVNU account)
  const body = '{"payment_method":{"provider_selection":{"remitter":{"account_identifier":{"type":"sort_code_account_number","sort_code":"101010","account_number":"12345681"},"account_holder_name":"Chris Carty"},"type":"preselected","provider_id":"mock-payments-gb-redirect","scheme_id":"faster_payments_service"},"beneficiary":{"account_identifier":{"type":"sort_code_account_number","sort_code":"123456","account_number":"12345678"},"type":"external_account","account_holder_name":"Merchant X","reference":"RVNU"},"type":"bank_transfer"},"user":{"name":"Chris","phone":"+447777777777","id":"c7f1de07-e0e9-4afe-9d35-6cf72b372cfb"},"amount_in_minor":100,"currency":"GBP"}'
  

  // For user selected bank in-flow (not pre-selected):

  /*

  '{"payment_method":{"provider_selection":{"remitter":{"account_identifier":{"type":"sort_code_account_number","sort_code":"123456","account_number":"12345678"},"account_holder_name":"Chris Carty"},"type":"preselected","provider_id":"mock-payments-gb-redirect","scheme_id":"faster_payments_service"},"beneficiary":{"account_identifier":{"type":"sort_code_account_number","sort_code":"123456","account_number":"12345678"},"type":"external_account","account_holder_name":"Merchant X","reference":"RVNU"},"type":"bank_transfer"},"user":{"name":"Chris","phone":"+447777777777","id":"c7f1de07-e0e9-4afe-9d35-6cf72b372cfb"},"amount_in_minor":100,"currency":"GBP"}'


  '{"payment_method":{"provider_selection":{"type":"user_selected"},"beneficiary":{"account_identifier":{"type":"sort_code_account_number","sort_code":"123456","account_number":"12345678"},"type":"external_account","account_holder_name":"Merchant X","reference":"RVNU"},"type":"bank_transfer"},"user":{"name":"Chris","phone":"+447777777777","id":"c7f1de07-e0e9-4afe-9d35-6cf72b372cfb"},"amount_in_minor":100,"currency":"GBP"}'
  */



  const tlSignature = tlSigning.sign({
    kid,
    privateKeyPem,
    method: "POST", // as we're sending a POST request
    path: "/payments", // the path of our request
    // All signed headers *must* be included unmodified in the request.
    headers: { 
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json", 
    },
    body,
  });

  const request = {
    method: "POST",
    url: "https://api.truelayer-sandbox.com/payments",
    // Request body & any signed headers *must* exactly match what was used to generate the signature.
    data: body,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
      "Tl-Signature": tlSignature,
    }
  };

  axios(request)//
  // 204 means success
  .then(response => 
    res.json('https://payment.truelayer-sandbox.com/payments#payment_id=' + response.data.id + '&resource_token=' + response.data.resource_token + '&return_uri=http://localhost:3001')
    )
  // 401 means either the access token is invalid, or the signature is invalid.
  .catch(err => console.warn(`${err.response.status} ${JSON.stringify(err.response.data)}`));

}

// Store Transaction Information in Database
export const storeTransaction = async (req, res) => {

    const paymentID = req.params.transactionID
    const merchantID = req.params.merchantID
    const accountID = req.params.accountID
    const remitterProviderID = req.params.remitterID
    const rvnuCodeID = req.params.rvnuCodeID
    const currency = req.params.currency
    const amount = req.params.amount
    // To do... round to 2 DP 
    const rvnuFee = (amount * 0.007)
    const rvnuFeeRounded = Math.round((rvnuFee + Number.EPSILON) * 100) / 100
    const reference = 'RVNU-TEST'

    // Get the % commission this merchant has agreed to pay
    const query1 = "SELECT CommissionPercentage FROM Merchant WHERE MerchantID='" + merchantID + "' LIMIT 1"

    try {
      conn.query(query1, (err, rows) => {
        if(err) return res.status(409).send({ message: err.message })
        //res.status(200).json({data});
        const count = rows.length;

        if (count) {

            const merchantCommissionRate = rows.map(i => i.CommissionPercentage)[0];
            // Calc how much the RVNU user who's code was used will earn 
            // To do... round to 2 DP 
            const userCommissionEarned  = amount * (merchantCommissionRate / 100)
            const userCommissionRounded = Math.round((userCommissionEarned + Number.EPSILON) * 100) / 100

            // Make a record of this transaction in the database;
            const query2 = "INSERT INTO RvnuTransaction (PaymentID, MerchantID, AccountID, RemitterProviderID, DateTime, Currency, TotalAmount, RvnuCodeID, RvnuFee, UserCommission, Reference) VALUES ('"+ paymentID + "', '" + merchantID + "', '" + accountID + "', '" + remitterProviderID + "', NOW(), '" + currency + "', '" + amount +  "', '" + rvnuCodeID + "', '" + rvnuFeeRounded + "', '" + userCommissionRounded + "', '" + reference + "')"

            try {
              conn.query(query2, (err) => {
                if(err) return res.status(409).send({ message: err.message })
                res.status(200).json("Successfully stored transaction");
              });
            } catch (err) {
                res.status(409).send({ message: err.message })
            }

        } else {
          console.log('error: could not get merchant commission');
        }

      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }

}

export const getPaymentStatus = async (req, res) => {
  // Gets users preferred payment account
  const paymentId = req.params.paymentId
  
  const query = "SELECT Status FROM RvnuTransaction WHERE PaymentID ='"+ paymentId +"' LIMIT 1"

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}
