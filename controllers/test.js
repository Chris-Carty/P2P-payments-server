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
const rvnuMerchantAccountId = process.env.RVNU_MERCHANT_ACCOUNT_ID;
const authServerUri = process.env.AUTH_SERVER_URI;
const environmentUri = process.env.ENVIRONMENT_URI;

// Initiate commission payout
const initiateCommissionPayout = async () => {
  const payment_id = "fbe6d4bd-6d16-4881-961e-161f23801631";

  // Update database to save users payment details for next time
  const query = `SELECT RvnuPayment.Commission, RvnuAccount.AccountID, RvnuAccount.iban, RvnuAccount.AccountName FROM RvnuPayment INNER JOIN RvnuSession ON RvnuPayment.RvnuPaymentID=RvnuSession.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuSession.RecommenderID=RvnuAccount.AccountID WHERE RvnuPayment.TrueLayerPaymentID='${payment_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });

      Object.keys(data).forEach(function (key) {
        // STEP 2: Store the vars from the query
        var row = data[key];
        const amountRounded = 500;
        const RvnuRecommenderId = row.AccountID;
        const RvnuRecommenderIban = "GB22MONZ04000405871454";
        const RvnuRecommenderName = "Christopher Carty";
        const reference = "Pay. Share. Earn.";

        // Set random idempotencyKey
        const idempotencyKey = uuidv4();

        // Access Token
        const accessToken = getAccessToken();

        accessToken.then(function (token) {
          // SOURCE ACCOUNT PRESELECTED ROUTE
          const body =
            '{"beneficiary":{"type":"external_account","account_identifier":{"type":"iban","iban":"' +
            RvnuRecommenderIban +
            '"},"reference":"' +
            reference +
            '","account_holder_name":"' +
            RvnuRecommenderName +
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
            .then((response) =>
              updatePayoutTable(
                response.data.id,
                RvnuRecommenderId,
                amountRounded,
                reference,
                payment_id
              )
            )
            .catch(function (error) {
              console.log(error.response.data);
            });
        });
      });
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

const updatePayoutTable = async (
  payoutId,
  accountId,
  amount,
  reference,
  payment_id
) => {
  // Update database to save users payment details for next time
  const query = `INSERT INTO RvnuCommissionPayout (PayoutID, AccountID, TotalAmount, Reference, TrueLayerPaymentId) VALUES ('${payoutId}', '${accountId}', '${amount}', '${reference}', '${payment_id}')`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

// Get access token for payouts
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

initiateCommissionPayout();
