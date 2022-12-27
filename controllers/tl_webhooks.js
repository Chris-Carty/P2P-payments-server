import conn from '../config/dbConfig.js'
import bcrypt from 'bcryptjs'

/*------------ WEBHOOKS ------------*/

// Logic to listen for and handle TrueLayer webhooks

const paymentSettled = async (status, payment_id, event_id, settled_at) => {

    // Update database to reflect 'payment_settled' status
    const query = `UPDATE RvnuTransaction SET Status = '${status}', EventID = '${event_id}', Webhook_Datetime = '${settled_at}' WHERE PaymentID = '${payment_id}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return console.log({ message: err.message })
    });
    } catch (err) {
        console.log(err.response.data)
    }
  
  }
  
  const paymentFailed = async (status, payment_id, event_id, failed_at, description, provider_id) => {
  
    // Update database to reflect 'payment_settled' status
    const query = `UPDATE RvnuTransaction SET Status = '${status}', EventID = '${event_id}', Webhook_Datetime = '${failed_at}', Webhook_Description = '${description}_${provider_id}' WHERE PaymentID = '${payment_id}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return console.log({ message: err.message })
    });
    } catch (err) {
        console.log(err.response.data)
    }
  
  }
  
  const addUserBankDetails = async (requestItems) => {
  
        const user_id = requestItems.user_id
    
        const account_holder_name = requestItems.payment_source.account_holder_name
    
        const sort_code = requestItems.payment_source.account_identifiers[0].sort_code
    
        const account_number = requestItems.payment_source.account_identifiers[0].account_number
    
        const iban = requestItems.payment_source.account_identifiers[1].iban

        const provider_id = requestItems.payment_method.provider_id

        /*
        // HASHING
        // salt should be created ONE TIME upon sign up
        // Hash account number
        const saltAccNo = bcrypt.genSaltSync(10);
        const hashAccNo = bcrypt.hashSync(account_number, saltAccNo);
        // Hash sortcode
        const saltSortCode = bcrypt.genSaltSync(10);
        const hashSortCode = bcrypt.hashSync(sort_code, saltSortCode);
        // Hash iban
        const saltIban = bcrypt.genSaltSync(10);
        const hashIban = bcrypt.hashSync(iban, saltIban);
        */

        // Update database to save users payment details for next time
        const query = `UPDATE RvnuAccount SET AccountName = '${account_holder_name}', SortCode = '${sort_code}', AccountNumber = '${account_number}', iban = '${iban}', Tl_providerId = '${provider_id}' WHERE AccountID = '${user_id}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return console.log({ message: err.message })
    });
    } catch (err) {
        console.log(err.response.data)
    }
  
  }

  
  // Handle webhook notifications sent from TrueLayer
  // Webhook URI set in the TrueLayer console (use ngrok whilst in development mode)
  // Payment notifictions have three 'type'(s):
  // payment_settled, payment_executed, payment_failed
  export const handleEventNotification = async (req, res) => { 


      try {
  
          //const signature = req.header('Tl-Signature')
          const requestItems = req.body
  
          console.log("Webhook Notification:")
          console.log(requestItems)
  
          const status = requestItems.type
          const payment_id = requestItems.payment_id
          const event_id = requestItems.event_id
    
          switch(status) {
  
            case 'payment_settled':
  
              addUserBankDetails(requestItems)
              const settled_at = requestItems.settled_at
              paymentSettled(status, payment_id, event_id, settled_at)
              break;
  
            case 'payment_failed':

              const provider_id = requestItems.payment_method.provider_id
              const description = requestItems.failure_reason
              const failed_at = requestItems.failed_at
              paymentFailed(status, payment_id, event_id, failed_at, description, provider_id)
              break;
  
            default:
              //paymentFailed()
          }
  
      } catch (error) {
            console.log(error)
      }
    
    
  };
  
  