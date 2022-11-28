import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

    const hostedHooks_api_key = process.env.HOSTEDHOOKS_API_KEY


    // HostedHook enpoint IDs 
    const endpoint_id = "5819f230-be35-46ef-9bdc-2effd3bf06f7"
    const subscription_id = "9ae067ff-0697-496e-8536-8d631bc1e039"

    function sendMessage() {
      var url = new URL("https://www.hostedhooks.com/api/v1/apps/40e68279-d691-4e58-b98c-4f85c749aecc/messages");
    
      var myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${hostedHooks_api_key}`);
      myHeaders.append("Content-Type", "application/json");
    
      /* Build message payload  */
      var messagePayload = JSON.stringify({
        "data": {
          "user": {
            "id": "1337", 
            "notes": "foobar",
          }
        },
        "version": "1.0",
        "event_type": "payment:updated"
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

sendMessage()
