import dotenv from 'dotenv'
import axios from 'axios'
import conn from '../config/dbConfig.js'
import { randomUUID } from 'crypto'
import * as tlSigning from 'truelayer-signing'

dotenv.config({ path: '../.env' }); // Load environment variables into process.env

const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET


// 9286a4c4-7c1d-4b12-b79b-36ef94ac54fc

  /*

// Retrieve access token to enable payment initiation
export const getAccessToken = async (req, res) => {

    const options = {
      method: 'POST',
      url: 'https://auth.truelayer-sandbox.com/connect/token',
      data: {
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'payments',
        grant_type: 'client_credentials'
      }
    };
    
    axios.request(options).then(response =>
      //res.json(response.data.access_token)
      //getPaymentStatus(response.data.access_token)
      console.log(response.data.access_token)
    ).catch(function (error) {
      res.send({ message: error});
    });
  
  }

  */


// Retrieve access token to enable payment initiation
export const getPaymentStatus = async (req, res) => {

    //const accessToken = req.params.accessToken
    //const paymentId = req.params.paymentId
  
    const request = {
      method: "GET",
      url: "https://api.truelayer-sandbox.com/payments/9286a4c4-7c1d-4b12-b79b-36ef94ac54fc",
      headers: {
      "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE0NTk4OUIwNTdDOUMzMzg0MDc4MDBBOEJBNkNCOUZFQjMzRTk1MTBSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6IkZGbUpzRmZKd3poQWVBQ291bXk1X3JNLWxSQSJ9.eyJuYmYiOjE2Njc3NDY2OTgsImV4cCI6MTY2Nzc1MDI5OCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnRydWVsYXllci1zYW5kYm94LmNvbSIsImF1ZCI6InBheW1lbnRzX2FwaSIsImNsaWVudF9pZCI6InNhbmRib3gtcnZudS0wMzAzOWMiLCJqdGkiOiJGQ0FEQTRDMjUyQzRDOUNCMjExMkUyNUIzNzUwN0Y0MiIsImlhdCI6MTY2Nzc0NjY5OCwic2NvcGUiOlsicGF5bWVudHMiXX0.3l1TXq0xFYgsJM-AE5xTuytzyAJXTb9xODe0uXiLmE8bbopVzkuGH4aG_iBChuBNVesWwokjLErnKxu5YneWLDb3UWC46rJQ8Pghlvzf5mdsfzNlSl8IyZFkGZM12-B5sAAq5MXfcuLukfagWsScLEJPHWJUtCelPfruX3kGlLhM5G6vKtWR0wx4B0KFO7yhfGU6mfh4HJOhkiJDLr5mn6xUs_7j3rFDzMgYAfcYB9L3hU_hlRCGDE0SPlZ9W4txMW4e22VDplK-OkmGZ6Zmo5-7fr2qON_ejmlqfk1NdFwSiOxB9ckfLUzkAvnoLm7hwMZ1OQyFrIJQtmejiBpmyQ",
      "Content-Type": "application/json",
      }
  };
    
    axios.request(request).then(response =>
        console.log(response)
      //res.json(response.data)
    ).catch(function (error) {
      //res.send({ message: error});
      console.log(error)
    });
  
  }

getPaymentStatus()