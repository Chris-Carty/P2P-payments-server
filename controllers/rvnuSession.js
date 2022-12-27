import conn from '../config/dbConfig.js'
import { v4 as uuidv4 } from 'uuid';

export const createSession = async (req, res) => {

  // Generate unique Session ID 
  const sessionId = uuidv4();
  // Session vars
  const clientId = req.params.clientId
  const rvnuPaymentId = req.params.rvnuPaymentId
  const accountId = req.params.accountId

  // Insert Session vars into table
  const query = `INSERT INTO RvnuSession (SessionID, ClientID, AccountID, SessionStart, RvnuPaymentID, SessionTimeout) VALUES ('${sessionId}', '${clientId}', '${accountId}',  CURRENT_TIMESTAMP, '${rvnuPaymentId}', DATE_ADD(now(), INTERVAL 30 MINUTE))`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data, sessionId});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }  

}

export const validateSession = async (req, res) => {

    // Validate SessionID cookie, see if it matches the paymet_request_id in the URL provided and has not timedout.

    const sessionId = req.params.sessionId
    const rvnuPaymentId = req.params.rvnuPaymentId
  
    // Insert Session vars into table
    const query = `SELECT SessionID, SessionTimeout FROM RvnuSession WHERE SessionID='${sessionId}' AND RvnuPaymentID='${rvnuPaymentId}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })

        if(data.length === 0) {
            // If response array is empty, the client_id or payment_request_id does not exists
            res.status(409).send({ message: 'payment_request_id not valid for this session' })
    
          } else {
    
            Object.keys(data).forEach(function(key) {
              var row = data[key];
              const sessionTimeout = row.SessionTimeout
      
              function isInThePast(date) {
                const today = new Date();
                return date < today;
              }
      
              // Ensure payment has not expired.
              if (!isInThePast(new Date(sessionTimeout))) {
                // If not expired, send response object. 
                res.status(200).json({data});
              } else {
                res.status(408).json("Session timeout");
              }
          
            });
    
          }
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }  
  
  }

  export const updateMobile = async (req, res) => {

    const sessionId = req.params.sessionId
    const mobileNumber = req.params.mobileNumber
  
    // Update mobile number field in table
    const query = `UPDATE RvnuSession SET MobileNumber='${mobileNumber}' WHERE SessionID='${sessionId}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        res.status(200).json({data});
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }  
  
  }

  export const updateNewUser = async (req, res) => {

    const sessionId = req.params.sessionId
    const mobileNumber = req.params.mobileNumber
    const bool = req.params.bool
  
    // Update mobile number field in table
    const query = `UPDATE RvnuSession SET NewUser=${bool} WHERE SessionID='${sessionId}' AND MobileNumber='${mobileNumber}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        res.status(200).json({data});
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }  
  
  }

  export const getNewUser = async (req, res) => {

    const sessionId = req.params.sessionId
    const rvnuPaymentId = req.params.rvnuPaymentId
  
    const query = `SELECT NewUser WHERE SessionID='${sessionId}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        res.status(409).send({data})
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }  
  
  }

  export const updateVerified = async (req, res) => {

    const sessionId = req.params.sessionId
    const mobileNumber = req.params.mobileNumber
  
    // Update mobile number field in table
    const query = `UPDATE RvnuSession SET Verified='${1}' WHERE SessionID='${sessionId}' AND MobileNumber='${mobileNumber}'`
  
    try {
      conn.query(query, (err, data) => {
        if(err) return res.status(409).send({ message: err.message })
        res.status(200).json({data});
      });
    } catch (err) {
        res.status(409).send({ message: err.message })
    }  
  
  }