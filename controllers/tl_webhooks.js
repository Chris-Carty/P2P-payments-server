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

/*------------ FUNCTIONS TO CALL WHEN WEBHOOK RECIEVED ------------*/

// Logic to listen for and handle TrueLayer webhooks

const paymentSettled = async (status, payment_id, event_id, settled_at) => {
  // Update database to reflect 'payment_settled' status
  const query = `UPDATE RvnuPayment SET WebhookStatus = '${status}', WebhookEventID = '${event_id}', WebhookDatetime = '${settled_at}' WHERE TrueLayerPaymentID = '${payment_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

const paymentFailed = async (
  status,
  payment_id,
  event_id,
  failed_at,
  description,
  provider_id
) => {
  // Update database to reflect 'payment_settled' status
  const query = `UPDATE RvnuPayment SET WebhookStatus = '${status}', WebhookEventID = '${event_id}', WebhookDatetime = '${failed_at}', WebhookDescription = '${description}_${provider_id}' WHERE TrueLayerPaymentID = '${payment_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

const addUserBankDetails = async (requestItems) => {
  // Payer info to save
  const user_id = requestItems.user_id;

  const account_holder_name = requestItems.payment_source.account_holder_name;

  const sort_code =
    requestItems.payment_source.account_identifiers[0].sort_code;

  const account_number =
    requestItems.payment_source.account_identifiers[0].account_number;

  const iban = requestItems.payment_source.account_identifiers[1].iban;

  const provider_id = requestItems.payment_method.provider_id;

  // Update database to save users payment details for next time
  const query = `UPDATE RvnuAccount SET AccountName = '${account_holder_name}', SortCode = '${sort_code}', AccountNumber = '${account_number}', iban = '${iban}', Tl_providerId = '${provider_id}' WHERE AccountID = '${user_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });
    });
  } catch (err) {
    console.log(err.response.data);
  }
};

// Active Rvnu Username
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
                //console.log(data);
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

// Initiate commission payout
const initiateCommissionPayout = async (requestItems) => {
  const payment_id = requestItems.payment_id;

  // Update database to save users payment details for next time
  const query = `SELECT RvnuPayment.Commission, RvnuAccount.AccountID, RvnuAccount.iban, RvnuAccount.AccountName FROM RvnuPayment INNER JOIN RvnuSession ON RvnuPayment.RvnuPaymentID=RvnuSession.RvnuPaymentID INNER JOIN RvnuAccount ON RvnuSession.RecommenderID=RvnuAccount.AccountID WHERE RvnuPayment.TrueLayerPaymentID='${payment_id}'`;

  try {
    conn.query(query, (err, data) => {
      if (err) return console.log({ message: err.message });

      Object.keys(data).forEach(function (key) {
        // STEP 2: Store the vars from the query
        var row = data[key];
        const amount = row.Commission * 100;
        const amountRounded = Math.round((amount + Number.EPSILON) * 100) / 100;
        const RvnuRecommenderId = row.AccountID;
        const RvnuRecommenderIban = row.iban;
        const RvnuRecommenderName = row.AccountName;
        const reference = "Commission payout";
        //const reference = uuidv4().substring(0, 18);

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
      console.log(data);
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
      const event_id = requestItems.event_id;

      switch (status) {
        case "payment_settled":
          const settled_at = requestItems.settled_at;
          paymentSettled(status, payment_id, event_id, settled_at);
          // Save payers bank deatild for next time
          addUserBankDetails(requestItems);
          // Pay out commission to user whose recommenderID was used
          initiateCommissionPayout(requestItems);
          // Update Rvnu code aassociated to the payer username
          activateUsername(requestItems.payment_id);
          // updateRecommenderAssets
          // merchantPayout()
          // SendRvnucommissionSmS
          // updateRvnuFlowSuccessColumn
          // Send newUserSmS
          // Notify TrueLayer webhook delivered successfully
          break;

        case "payment_failed":
          const provider_id = requestItems.payment_method.provider_id;
          const description = requestItems.failure_reason;
          const failed_at = requestItems.failed_at;
          paymentFailed(
            status,
            payment_id,
            event_id,
            failed_at,
            description,
            provider_id
          );
          break;

        default:
        //paymentFailed()
      }
    }
  } catch (error) {
    console.log(error);
  }
};
