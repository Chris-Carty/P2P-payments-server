import dotenv from "dotenv";
import axios from "axios";
import conn from "../config/dbConfig.js";
import { v4 as uuidv4 } from "uuid";
import * as tlSigning from "truelayer-signing";

dotenv.config({ path: "../.env" }); // Load environment variables into process.env

// Global Environment variables
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const kid = process.env.CERTIFICATE_ID;
const privateKeyPem = process.env.PRIVATE_KEY;
const rvnuMerchantAccountId = process.env.RVNU_MERCHANT_ACCOUNT_ID;
const authServerUri = process.env.AUTH_SERVER_URI;
const environmentUri = process.env.ENVIRONMENT_URI;
// RedirectURI
const return_uri = "https://rvnu.app/status";

export const generatePaymentLink = async (req, res) => {
  // Set request vars
  const clientId = req.params.client_id;
  const rvnuPaymentId = req.params.payment_request_id;
  const sessionId = req.params.sessionId;

  //STEP 1: Get payment info for this payment_request_id
  const query = `SELECT RvnuSession.AccountID, RvnuSession.NewUser, RvnuPayment.PayerName, RvnuPayment.Currency, RvnuPayment.TotalAmount, RvnuPayment.Reference, RvnuAccount.MobileNumber, RvnuAccount.AccountName, RvnuAccount.SortCode, RvnuAccount.AccountNumber, RvnuAccount.Tl_providerId
  FROM RvnuSession INNER JOIN RvnuPayment ON RvnuSession.RvnuPaymentID=RvnuPayment.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuAccount.AccountID=RvnuSession.AccountID WHERE RvnuSession.RvnuPaymentID='${rvnuPaymentId}' AND RvnuSession.ClientID='${clientId}' AND RvnuSession.SessionID='${sessionId}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return res.status(409).send({ message: err.message });
      Object.keys(data).forEach(function (key) {
        // STEP 2: Store the vars from the query
        var row = data[key];
        const payerId = row.AccountID;
        const newUser = row.NewUser;
        const payerName = row.PayerName;
        const currency = row.Currency;
        const amount = row.TotalAmount * 100;
        const amountRounded = Math.round((amount + Number.EPSILON) * 100) / 100;
        const reference = row.Reference;
        const payerAccountName = row.AccountName;
        const payerAccountNumber = row.AccountNumber;
        const payerSortCode = row.SortCode;
        const payerProviderId = row.Tl_providerId;
        const payerPhoneNumber = row.MobileNumber;
        // Sandbox pre-selected account values
        //const payerSortCode = "101010"
        //const payerAccountNumber = "12345681"
        //const payerProviderId = "mock-payments-gb-redirect"

        // STEP 3: Retrieve access token to enable payment initiation
        const accessToken = getAccessToken();
        accessToken.then(function (token) {
          // STEP:4 Pass the accessToken and Payment vars to initiatePayment()
          const paymentInit = initiatePayment(
            token,
            payerId,
            newUser,
            payerName,
            currency,
            amountRounded,
            reference,
            payerAccountName,
            payerAccountNumber,
            payerSortCode,
            payerProviderId,
            payerPhoneNumber
          );

          paymentInit.then(function (payment) {
            // STEP 4: Add TrueLayer Payment_id to the RvnuSession table.
            const query = `UPDATE RvnuPayment SET TrueLayerPaymentID = '${payment.id}' WHERE RvnuPaymentID ='${rvnuPaymentId}' AND ClientID='${clientId}'`;

            try {
              conn.query(query, (err, data) => {
                if (err) return res.status(409).send({ message: err.message });
                // STEP 5: Return the TrueLayer payment link generated by the initiatePayment() to the front end.
                res.status(200).json({
                  payment_id: payment.id,
                  resource_token: payment.resource_token,
                  return_uri: return_uri,
                });
              });
            } catch (err) {
              res.status(409).send({ message: err.message });
            }
          });
        });
      });
    });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
};

const initiatePayment = (
  accessToken,
  payerId,
  newUser,
  payerName,
  currency,
  amountRounded,
  reference,
  payerAccountName,
  payerAccountNumber,
  payerSortCode,
  payerProviderId,
  payerPhoneNumber
) => {
  const idempotencyKey = uuidv4();

  //-----***** PRODUCTION BODY *****-----//
  // If newUser === 1 or payerBankInfo missing, show bank selector
  const body =
    newUser === 1 ||
    payerProviderId === null ||
    payerSortCode === null ||
    payerAccountNumber === null ||
    payerAccountName === null
      ? '{"payment_method":{"type":"bank_transfer","provider_selection":{"type":"user_selected","scheme_selection":{"type":"instant_only","allow_remitter_fee":false}},"beneficiary":{"type":"merchant_account","merchant_account_id":"' +
        rvnuMerchantAccountId +
        '", "reference":"' +
        reference +
        '"}},"user":{"id":"' +
        payerId +
        '","name":"' +
        payerName +
        '","phone":"' +
        payerPhoneNumber +
        '"},"amount_in_minor":' +
        amountRounded +
        ',"currency":"' +
        currency +
        '"}'
      : '{"payment_method":{"type":"bank_transfer","provider_selection":{"type":"preselected","scheme_selection":{"type":"instant_only","allow_remitter_fee":false}, "remitter": {"account_identifier": {"type": "sort_code_account_number","sort_code": "' +
        payerSortCode +
        '", "account_number": "' +
        payerAccountNumber +
        '"},"account_holder_name": "' +
        payerName +
        '"}, "provider_id": "' +
        payerProviderId +
        '","scheme_id": "faster_payments_service"},"beneficiary":{"type":"merchant_account","merchant_account_id":"' +
        rvnuMerchantAccountId +
        '", "reference":"' +
        reference +
        '"}},"user":{"id":"' +
        payerId +
        '","name":"' +
        payerName +
        '","phone":"' +
        payerPhoneNumber +
        '"},"amount_in_minor":' +
        amountRounded +
        ',"currency":"' +
        currency +
        '"}';

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
      Authorization: `Bearer ${accessToken}`,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
      "Tl-Signature": tlSignature,
    },
  };

  return axios
    .request(request)
    .then((response) => response.data)
    .catch(function (error) {
      console.log(error);
    });
};

// Retrieve access token to enable payment initiation
export const getPaymentStatus = async (req, res) => {
  const paymentId = req.params.truelayerPaymentId;

  const accessToken = getAccessToken();

  accessToken.then(function (token) {
    const request = {
      method: "GET",
      url: environmentUri + `/payments/${paymentId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    axios
      .request(request)
      .then((response) => res.json(response.data.status))
      .catch(function (error) {
        res.send({ message: error });
      });
  });
};

const getAccessToken = () => {
  const options = {
    method: "POST",
    url: authServerUri + "/connect/token",
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      scope: "payments",
      grant_type: "client_credentials",
    },
  };

  return axios
    .request(options)
    .then((response) => {
      return response.data.access_token;
    })
    .catch(function (error) {
      return error;
    });
};

// Retrieve access token to enable payment initiation
export const validatePayment = async (req, res) => {
  const clientId = req.params.clientId;
  const rvnuPaymentId = req.params.rvnuPaymentId;

  const query = `SELECT RvnuPaymentID, PaymentTimeout FROM RvnuPayment WHERE RvnuPaymentID='${rvnuPaymentId}' AND ClientID='${clientId}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return res.status(409).send({ message: err.message });

      if (data.length === 0) {
        // If response array is empty, the client_id or payment_request_id does not exists
        res
          .status(408)
          .send({ message: "Invalid client_id or payment_request_id" });
      } else {
        res.status(200).json({ data });
        /*
        Object.keys(data).forEach(function (key) {
          var row = data[key];
          const PaymentTimeout = row.PaymentTimeout;

          function isInThePast(date) {
            const today = new Date();
            return date < today;
          }

          // Ensure payment has not expired.
          if (!isInThePast(new Date(PaymentTimeout))) {
            // If not expired, send response object.
            res.status(200).json({ data });
          } 
        });
        */
      }
    });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
};

// Retrieve Merchant name + payment amount for frontend
export const getPaymentInfoForClient = async (req, res) => {
  const clientId = req.params.clientId;
  const rvnuPaymentId = req.params.rvnuPaymentId;

  const query = `SELECT RvnuPayment.TotalAmount, RvnuMerchant.MerchantName, RvnuMerchant.RedirectUri FROM RvnuApp INNER JOIN RvnuPayment ON RvnuApp.ClientID=RvnuPayment.ClientID INNER JOIN RvnuMerchant ON RvnuApp.MerchantID=RvnuMerchant.MerchantID WHERE RvnuPayment.RvnuPaymentID='${rvnuPaymentId}' AND RvnuPayment.ClientID='${clientId}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return res.status(409).send({ message: err.message });
      res.status(200).json({ data });
    });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
};

// Retrieve Successful payment info for payment success screen
export const getSuccessfulPaymentInfo = async (req, res) => {
  let rvnuPaymentId = "";
  let recommenderUsername = "";
  let recommenderCommission = 0;
  let payerId = "";
  let payerUsername = "";
  let payerUsernameExpiry = "";

  const trueLayerPaymentId = req.params.trueLayerPaymentId;

  const query = `SELECT RvnuAccount.Username, RvnuPayment.RvnuPaymentID, RvnuPayment.Commission, RvnuSession.AccountID FROM RvnuPayment INNER JOIN RvnuSession ON RvnuPayment.RvnuPaymentID=RvnuSession.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuSession.RecommenderID=RvnuAccount.AccountID WHERE RvnuPayment.TrueLayerPaymentID='${trueLayerPaymentId}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return res.status(409).send({ message: err.message });

      if (data.length === 0) {
        return res.status(408).json("Payment does not exist");
      } else {
        Object.keys(data).forEach(function (key) {
          var row = data[key];
          rvnuPaymentId = row.RvnuPaymentID;
          recommenderUsername = row.Username;
          recommenderCommission = row.Commission;
          payerId = row.AccountID;
        });

        const query = `SELECT RvnuAccount.Username, RvnuCode.Expiry FROM RvnuAccount
          INNER JOIN RvnuCode ON RvnuAccount.RvnuCodeID=RvnuCode.RvnuCodeID
          WHERE RvnuAccount.AccountID='${payerId}'`;

        try {
          conn.query(query, (err, data) => {
            if (err) return res.status(409).send({ message: err.message });

            Object.keys(data).forEach(function (key) {
              var row = data[key];
              payerUsername = row.Username;
              payerUsernameExpiry = row.Expiry;
            });

            return res.status(200).json({
              rvnuPaymentId,
              recommenderUsername,
              recommenderCommission,
              payerUsername,
              payerUsernameExpiry,
            });
          });
        } catch (err) {
          res.status(409).send({ message: err.message });
        }
      }
    });
  } catch (err) {
    res.status(409).send({ message: err.message });
  }
};
