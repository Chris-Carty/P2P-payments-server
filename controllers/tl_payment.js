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
const merchantAccountId = process.env.MERCHANT_ACCOUNT_ID;
const authServerUri = process.env.AUTH_SERVER_URI;
const environmentUri = process.env.ENVIRONMENT_URI;
// RedirectURI
const return_uri = "https://gift-laura.vercel.app/status";

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

export const generatePaymentLink = async (req, res) => {
  // Set request vars
  const paymentAmount = req.params.paymentAmount * 100;
  const payerEmail = req.params.payerEmail;
  const payerName = req.params.payerName;
  const currency = "GBP";
  const reference = "Test 123";
  const payerId = uuidv4();

  //console.log(payerEmail);
  //console.log(paymentAmount);
  //console.log(payerName);

  // STEP 1: Retrieve access token to enable payment initiation
  const accessToken = getAccessToken();

  accessToken.then(function (accessToken) {
    // STEP2: Pass the accessToken and Payment vars to initiatePayment()
    const paymentInit = initiatePayment(
      accessToken,
      payerId,
      payerName,
      payerEmail,
      currency,
      paymentAmount,
      reference
    );

    paymentInit.then(function (payment) {
      // STEP 3: Return the TrueLayer payment link
      res.status(200).json({
        payment_id: payment.id,
        resource_token: payment.resource_token,
        return_uri: return_uri,
      });
    });
  });
};

const initiatePayment = (
  accessToken,
  payerId,
  payerName,
  payerEmail,
  currency,
  paymentAmount,
  reference
) => {
  const idempotencyKey = uuidv4();

  //-----***** PRODUCTION BODY *****-----//
  const body =
    '{"payment_method":{"type":"bank_transfer","provider_selection":{"type":"user_selected","scheme_selection":{"type":"instant_only","allow_remitter_fee":false}},"beneficiary":{"type":"merchant_account","merchant_account_id":"' +
    merchantAccountId +
    '", "reference":"' +
    reference +
    '"}},"user":{"id":"' +
    payerId +
    '","name":"' +
    payerName +
    '","email":"' +
    payerEmail +
    '"},"amount_in_minor":' +
    paymentAmount +
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
      console.log(error.response.data);
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
