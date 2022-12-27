import dotenv from 'dotenv'
import axios from 'axios'
import conn from '../config/dbConfig.js'
import { v4 as uuidv4 } from 'uuid';
import * as tlSigning from 'truelayer-signing'

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

// TrueLayer console variables
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const kid = process.env.CERTIFICATE_ID
const privateKeyPem = process.env.PRIVATE_KEY
const rvnuMerchantAccountId = process.env.RVNU_MERCHANT_ACCOUNT_ID
const authServerUri = process.env.AUTH_SERVER_URI
const environmentUri = process.env.ENVIRONMENT_URI

// Retrieve access token to enable payment initiation
export const getAccessToken = async (req, res) => {

  const options = {
    method: "POST",
    url:  authServerUri + "/connect/token",
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      scope: "payments",
      grant_type: 'client_credentials'
    }
  };
  
  axios.request(options).then(response =>
    res.json(response.data.access_token)
  ).catch(function (error) {
    res.send({ message: error});
  });

}

export const initiatePaymentExistingUser = async (req, res) => {

  // Payment Information 
  const amount = req.params.amount * 100
  const amountRounded = Math.round((amount + Number.EPSILON) * 100) / 100
  const currency = req.params.currency
  const reference = req.params.reference

  // Payer Information
  const payerPhoneNumber = req.params.payerMobile
  const payerId = req.params.payerAccountID

  // Access Token
  const accessToken = req.params.accessToken

  // Sandbox values
  //const payerSortCode = "101010"
  //const payerAccountNumber = "12345681"
  //const payerProviderId = "mock-payments-gb-redirect"

  // TO DO - request from DB and unencrypt
  //const payerSortCode = req.params.sortCode
  //const payerAccountNumber = req.params.AccountNumber
  //const payerSortCode = "040004"
  //const payerAccountNumber = "05871454"
  //const payerProviderId = "ob-monzo"
  //const payerName = "Christopher Carty"

  const query = `SELECT AccountName, SortCode, AccountNumber, Tl_providerId FROM RvnuAccount WHERE AccountID='${payerId}'`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })

      Object.keys(data).forEach(function(key) {
        var row = data[key];
        const payerSortCode = row.SortCode
        const payerAccountNumber = row.AccountNumber
        const payerProviderId = row.Tl_providerId
        const payerName = row.AccountName

        // Set random idempotencyKey
        const idempotencyKey = uuidv4();

        //-----***** PROD *****-----//
        const body = '{"payment_method":{"type":"bank_transfer","provider_selection":{"type":"preselected","scheme_selection":{"type":"instant_only","allow_remitter_fee":false}, "remitter": {"account_identifier": {"type": "sort_code_account_number","sort_code": "' + payerSortCode + '", "account_number": "' + payerAccountNumber + '"},"account_holder_name": "' + payerName + '"}, "provider_id": "' + payerProviderId + '","scheme_id": "faster_payments_service"},"beneficiary":{"type":"merchant_account","merchant_account_id":"' + rvnuMerchantAccountId + '", "reference":"' + reference + '"}},"user":{"id":"' + payerId + '","name":"' + payerName + '","phone":"' + payerPhoneNumber + '"},"amount_in_minor":' + amountRounded + ',"currency":"' + currency + '"}'
        
        
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
            url: environmentUri + "/payments",
            // Request body & any signed headers *must* exactly match what was used to generate the signature.
            data: body,
            headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Idempotency-Key": idempotencyKey,
            "Content-Type": "application/json",
            "Tl-Signature": tlSignature,
            }
        };
        
        // Add 'truelayer-sandbox' for testing
        axios.request(request).then(response =>
          res.json('https://payment.truelayer.com/payments#payment_id=' + response.data.id + '&resource_token=' + response.data.resource_token + '&return_uri=http://localhost:3000&c_primary=262626&c_secondary=000000&c_tertiary=000000') 
        ).catch(function (error) {
          res.send({ message: error});
          console.log(error.response.data)
        });


      });
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }
    
}

export const initiatePaymentNewUser = async (req, res) => {

  // Payment Information 
  const amount = req.params.amount * 100
  const amountRounded = Math.round((amount + Number.EPSILON) * 100) / 100
  const currency = req.params.currency
  const reference = req.params.reference

  // Payer Information
  const payerPhoneNumber = req.params.payerMobile
  const payerName = req.params.payerName
  const payerId = req.params.payerAccountID

  // Set random idempotencyKey
  const idempotencyKey = uuidv4();

  // Access Token
  const accessToken = req.params.accessToken
  
  const body = '{"payment_method":{"type":"bank_transfer","provider_selection":{"type":"user_selected","scheme_selection":{"type":"instant_only","allow_remitter_fee":false}},"beneficiary":{"type":"merchant_account","merchant_account_id":"' + rvnuMerchantAccountId + '", "reference":"' + reference + '"}},"user":{"id":"' + payerId + '","name":"' + payerName + '","phone":"' + payerPhoneNumber + '"},"amount_in_minor":' + amountRounded + ',"currency":"' + currency + '"}'
  
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
      url: environmentUri + "/payments",
      // Request body & any signed headers *must* exactly match what was used to generate the signature.
      data: body,
      headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
      "Tl-Signature": tlSignature,
      }
  };
  
  // Add 'truelayer-sandbox' for testing
  axios.request(request).then(response =>
     res.json('https://payment.truelayer.com/payments#payment_id=' + response.data.id + '&resource_token=' + response.data.resource_token + '&return_uri=http://localhost:3000&c_primary=262626&c_secondary=000000&c_tertiary=000000') 
  ).catch(function (error) {
    res.send({ message: error});
    console.log(error.response.data)
  });
    
}


// Store Transaction Information in Database
export const storeTransaction = async (req, res) => {


    const paymentID = req.params.transactionID
    const merchantID = req.params.merchantID
    const accountID = req.params.payerAccountID
    const recommenderID = req.params.recommenderID
    const currency = req.params.currency
    const amount = req.params.amount
    const reference = req.params.reference
    const assetsUpdated = 0
    const rvnuServiceFee = (amount * 0.007)
    const rvnuFeeRounded = Math.round((rvnuServiceFee + Number.EPSILON) * 100) / 100

    const query = `SELECT CommissionPercentage FROM Merchant WHERE MerchantID='${merchantID}'`

    try {

      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        //res.status(200).json({data});
        //console.log(res.status(200).json({data}))

        Object.keys(data).forEach(function(key) {
          var row = data[key];
          const merchantCommissionPercentage = row.CommissionPercentage

          // Calc commision for user who's code was used
          const recommenderCommissionEarned  = amount * (merchantCommissionPercentage / 100)
          const recommenderCommissionRounded = Math.round((recommenderCommissionEarned + Number.EPSILON) * 100) / 100


          const query = `INSERT INTO RvnuTransaction (PaymentID, MerchantID, AccountID, DateTime, Currency, TotalAmount, RvnuFee, RecommenderID, RecommenderCommission, RecommenderAssetsUpdated, Reference) VALUES ('${paymentID}', '${merchantID}', '${accountID}', CURRENT_TIMESTAMP, '${currency}', '${amount}','${rvnuFeeRounded}', '${recommenderID}', '${recommenderCommissionRounded}', '${assetsUpdated}','${reference}')`


          try {
            conn.query(query, (err, data) => {
              if(err) return res.status(409).send({ message: err.message })
              res.status(200).json({data});
      
          });
          } catch (err) {
              res.status(409).send({ message: err.message })
              console.log(error.response.data)
          }

      });
    });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }

}


// Retrieve access token to enable payment initiation
export const getPaymentStatus = async (req, res) => {

  const accessToken = req.params.accessToken
  const paymentId = req.params.paymentId

  const request = {
    method: "GET",
    url: `https://api.truelayer.com/payments/${paymentId}`,
    headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    }
};
  
  axios.request(request).then(response =>
    res.json(response.data)
  ).catch(function (error) {
    res.send({ message: error});
  });

}

// Retrieve access token to enable payment initiation
export const validatePayment = async (req, res) => {

  const clientId = req.params.clientId
  const rvnuPaymentId = req.params.rvnuPaymentId

  const query = `SELECT RvnuPaymentID, PaymentTimeout FROM RvnuPayment WHERE RvnuPaymentID='${rvnuPaymentId}' AND ClientID='${clientId}'`

   
  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })

      if(data.length === 0) {
        // If response array is empty, the client_id or payment_request_id does not exists
        res.status(409).send({ message: 'Invalid client_id or payment_request_id' })

      } else {

        Object.keys(data).forEach(function(key) {
          var row = data[key];
          const PaymentTimeout = row.PaymentTimeout
  
          function isInThePast(date) {
            const today = new Date();
            return date < today;
          }
  
          // Ensure payment has not expired.
          if (!isInThePast(new Date(PaymentTimeout))) {
            // If not expired, send response object. 
            res.status(200).json({data});
          } else {
            res.status(408).json("PaymentTimeout");
          }
      
        });

      }

    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}
