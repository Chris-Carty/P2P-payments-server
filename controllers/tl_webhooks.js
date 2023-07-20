import dotenv from "dotenv";
import conn from "../config/dbConfig.js";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import * as tlSigning from "truelayer-signing";

dotenv.config({ path: "../.env" }); // Load environment variables into process.env

// TrueLayer console variables
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const kid = process.env.CERTIFICATE_ID;
const privateKeyPem = process.env.PRIVATE_KEY;
const merchantAccountId = process.env.MERCHANT_ACCOUNT_ID;
const authServerUri = process.env.AUTH_SERVER_URI;
const environmentUri = process.env.ENVIRONMENT_URI;

/*------------ FUNCTIONS TO CALL WHEN WEBHOOK RECIEVED ------------*/

// Initiate commission payout
const initiatePayout = async (payment_id) => {
  //console.log("initiating payout");

  // Set random idempotencyKey
  const idempotencyKey = uuidv4();
  const payoutAccountIban = "GB70HLFX11039701183932";
  const payoutAccountName = "L Carty";
  const reference = "Gift payout";

  // Access Token
  const accessToken = getAccessToken();

  accessToken.then(function (token) {
    const paymentAmount = getPayment(token, payment_id);

    paymentAmount.then(function (amount) {
      const body =
        '{"beneficiary":{"type":"external_account","account_identifier":{"type":"iban","iban":"' +
        payoutAccountIban +
        '"},"reference":"' +
        reference +
        '","account_holder_name":"' +
        payoutAccountName +
        '"},"merchant_account_id":"' +
        merchantAccountId +
        '","amount_in_minor":' +
        amount +
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
        url: environmentUri + "/payouts",
        // Request body & any signed headers *must* exactly match what was used to generate the signature.
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
          "Idempotency-Key": idempotencyKey,
          "Content-Type": "application/json",
          "Tl-Signature": tlSignature,
        },
      };

      axios
        .request(request)
        .then((response) => {
          return response;
        })
        .catch(function (error) {
          console.log(error);
        });
    });
  });
};

const getAccessToken = async () => {
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
      console.log(error);
    });
};

const getPayment = async (token, payment_id) => {
  const options = {
    method: "GET",
    url: environmentUri + "/v3/payments/" + payment_id,
    // Request body & any signed headers *must* exactly match what was used to generate the signature.
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  return axios
    .request(options)
    .then((response) => {
      return response.data.amount_in_minor;
    })
    .catch(function (error) {
      console.log(error);
    });
};

// Handle webhook notifications sent from TrueLayer
// Webhook URI set in the TrueLayer console (use ngrok whilst in development mode)
// Payment notifictions have three 'type'(s):
// payment_settled, payment_executed, payment_failed
export const handleEventNotification = async (req, res) => {
  try {
    //const signature = req.header('Tl-Signature')
    const requestItems = req.body;

    if (Object.keys(requestItems).length >= 6) {
      res.status(200).send({ message: "webhook delivered successfully" });
      console.log(requestItems);
      const status = requestItems.type;
      const payment_id = requestItems.payment_id;

      switch (status) {
        case "payment_settled":
          // Send payment amount
          initiatePayout(payment_id);
          break;

        case "payment_failed":
          console.log("Ignore webhook");

          break;

        default:
          console.log("Ignore webhook");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
