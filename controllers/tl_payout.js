import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import * as tlSigning from "truelayer-signing";

dotenv.config({ path: "../.env" }); // Load environment variables into process.env

// TrueLayer console variables
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const kid = process.env.CERTIFICATE_ID;
const privateKeyPem = process.env.PRIVATE_KEY;
const rvnuMerchantAccountId = process.env.RVNU_MERCHANT_ACCOUNT_ID;

// Retrieve access token to enable payment initiation
export const getAccessToken = async (req, res) => {
  const options = {
    method: "POST",
    url: "https://auth.truelayer-sandbox.com/connect/token",
    data: {
      client_id: clientId,
      client_secret: clientSecret,
      scope: "payments",
      grant_type: "client_credentials",
    },
  };

  axios
    .request(options)
    .then((response) => res.json(response.data.access_token))
    .catch(function (error) {
      res.send({ message: error });
    });
};

export const initiateBusinessAccountPayout = async (req, res) => {
  // Payout Information
  const amount = req.params.amount * 100;
  const amountRounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const reference = req.params.reference;

  // Set random idempotencyKey
  const idempotencyKey = uuidv4();

  // Access Token
  const accessToken = req.params.accessToken;

  // RVNU BUSINESS ACCOUNT PAYOUT
  const body =
    '{"beneficiary":{"type":"business_account","account_identifier":{"type":"iban"},"reference":"' +
    reference +
    '"},"merchant_account_id":"' +
    rvnuMerchantAccountId +
    '","amount_in_minor":' +
    amountRounded +
    ',"currency":"GBP"}';

  const tlSignature = tlSigning.sign({
    kid,
    privateKeyPem,
    method: "POST", // as we're sending a POST request
    path: "/payouts", // the path of our request
    // All signed headers *must* be included unmodified in the request.
    headers: {
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
    },
    body,
  });

  const request = {
    method: "POST",
    url: "https://api.truelayer-sandbox.com/payouts",
    // Request body & any signed headers *must* exactly match what was used to generate the signature.
    data: body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
      "Tl-Signature": tlSignature,
    },
  };

  axios
    .request(request)
    .then((response) => res.json(response.data))
    .catch(function (error) {
      res.send({ message: error });
      console.log(error.response.data);
    });
};

// Retrieve status of a payout
export const getPayoutStatus = async (req, res) => {
  const accessToken = req.params.accessToken;
  const payoutId = req.params.payoutId;

  const request = {
    method: "GET",
    url: `https://api.truelayer-sandbox.com/payouts/${payoutId}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  axios
    .request(request)
    .then((response) => res.json(response.data))
    .catch(function (error) {
      res.send({ message: error });
    });
};
