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

// Get payoutAmount using payment
// Payout 95% (In Future after Laura's wedding)
const getPayment = async (payment_id) => {
  // Access Token
  const accessToken = getAccessToken();

  accessToken.then(function (token) {
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

getPayment("5244ad50-029c-41ac-9edf-c6acaea15561");
