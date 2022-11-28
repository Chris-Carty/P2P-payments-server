import conn from '../config/dbConfig.js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid';

// Load environment variables into process.env
dotenv.config({ path: '../.env' });

export const sendPaymentStatus = async (req, res) => {

    const rvnuFlowId = ""

    // Payment Info
    const paymentStatus = ""
    const paymentStatusMessage = ""
    const paymentId = ""
    const amount = ""
    const currency = ""

    // Parties
    const merchantId = ""
    const rvnuUserId = ""

    // HostedHook enpoint IDs 
    const endpoint_id = ""
    const subscription_id = ""

    const hostedHooks_api_key = process.env.HOSTEDHOOKS_API_KEY

    var url = new URL(`https://www.hostedhooks.com/api/v1/subscriptions/${subscription_id}/endpoints/${endpoint_id}/messages`);
  
    var myHeaders = new Headers();

    myHeaders.append("Authorization", `Bearer ${hostedHooks_api_key}`);
    myHeaders.append("Content-Type", "application/json");
  
    /* Build message payload  */
    var messagePayload = JSON.stringify({
        "data": {
          "context": {
            "userId": rvnuUserId
          },
          "content": {
            "rvnuFlowId": rvnuFlowId,
            "paymentRequestId": paymentId,
            "amount": amount,
            "currency": currency,
            "destination": {
              "merchantId": merchantId
            },
            "status": paymentStatus,
            "statusMessage": paymentStatusMessage
          }
        },
        "version": "1.0",
        "type": "payment:updated",
        "event_id": uuidv4(),
        "created": Date.now()
      });
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: messagePayload,
      redirect: 'follow'
    };
  
    fetch(url, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

}