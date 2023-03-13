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

  let amountRounded = 0;
  let RvnuRecommenderId = "";
  let RvnuRecommenderIban = "";
  let RvnuRecommenderName = "";
  let reference = "";

  // Set random idempotencyKey
  const idempotencyKey = uuidv4();

  // Update database to save users payment details for next time
  const query = `SELECT RvnuPayment.Commission, RvnuAccount.AccountID, RvnuAccount.iban, RvnuAccount.AccountName FROM RvnuPayment INNER JOIN RvnuSession ON RvnuPayment.RvnuPaymentID=RvnuSession.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuSession.RecommenderID=RvnuAccount.AccountID WHERE RvnuPayment.TrueLayerPaymentID='${payment_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });

      Object.keys(data).forEach(function (key) {
        // STEP 2: Store the vars from the query
        var row = data[key];
        amountRounded = 600;
        RvnuRecommenderId = row.AccountID;
        RvnuRecommenderIban = row.iban;
        RvnuRecommenderName = row.AccountName;
        reference = "Pay, share, earn.";
      });

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

// Retrieve access token to enable payment initiation
export const getPaymentStatus = async () => {
  const paymentId = "c0659241-3e05-4d1c-85f5-0b3f2ba73bdf";

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
      .then((response) => console.log(response.data))
      .catch(function (error) {
        console.log(error);
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

/*

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

*/

// ActiveUsername
const activateUsername = async (payment_id) => {
  const query = `SELECT RvnuAccount.AccountID, RvnuAccount.RvnuCodeID FROM RvnuPayment INNER JOIN RvnuSession ON RvnuPayment.RvnuPaymentID=RvnuSession.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuSession.AccountID=RvnuAccount.AccountID WHERE RvnuPayment.TrueLayerPaymentID='${payment_id}'`;

  let rvnuCodeId = "";
  let accountId = "";

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });

      Object.keys(data).forEach(function (key) {
        let row = data[key];
        rvnuCodeId = row.RvnuCodeID;
        accountId = row.AccountID;
      });

      if (rvnuCodeId === null) {
        // Generate RvnuCode
        // Generate unique RVNU code ID
        const newRvnuCodeId = uuidv4();

        // Insert new RVNU code in RvnuCode table
        // AND link this RVNU code to a user account
        const query = `INSERT INTO RvnuCode (RvnuCodeID, DateGenerated, Expiry) VALUES ('${newRvnuCodeId}',  CURRENT_TIMESTAMP, DATE_ADD(now(), INTERVAL 14 DAY))`;

        try {
          conn.query(query, (err, data) => {
            if (err) return res.status(409).send({ message: err.message });

            const query = `UPDATE RvnuAccount SET RvnuCodeID = '${newRvnuCodeId}' WHERE AccountID='${accountId}'`;

            try {
              conn.query(query, (err, data) => {
                if (err) return res.status(409).send({ message: err.message });
                console.log(data);
              });
            } catch (err) {
              console.log(err);
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

initiateCommissionPayout();
//getPaymentStatus();

//activateUsername("57924506-341c-4cc3-9bf4-467ced2c0961");
