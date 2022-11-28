import conn from '../config/dbConfig.js'
import { v4 as uuidv4 } from 'uuid';

export const generateRvnuCode = async (req, res) => {

  // Generate unique RVNU code ID 
  const rvnuCodeId = uuidv4();
  // User who new RVNU code is for
  const accountId = req.params.accountId

  // Insert new RVNU code in RvnuCode table
  // AND link this RVNU code to a user account
  const query = `INSERT INTO RvnuCode (RvnuCodeID, DateGenerated, Expiry) VALUES ('${rvnuCodeId}',  CURRENT_TIMESTAMP, DATE_ADD(now(), INTERVAL 14 DAY))`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })

      const query = `UPDATE RvnuAccount SET RvnuCodeID = '${rvnuCodeId}' WHERE AccountID='${accountId}'`

      try {
        conn.query(query, (err, data) => {
          if(err) return res.status(409).send({ message: err.message })
          res.status(200).json(rvnuCodeId);
          
        });
      } catch (err) {
          res.status(409).send({ message: err.message })
      }  

    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }  

}

export const getUserRvnuExpiry = async (req, res) => {
  // Get the Expiry date of a RVNU code
  const rvnuCodeId = req.params.rvnuCodeId

  const query = `SELECT Expiry FROM RvnuCode WHERE RvnuCodeID='${rvnuCodeId}'`

  conn.query(query, function (err, data, fields) {
    if(err) return res.status(409).send({ message: err.message })
    res.status(200).json({data});
  });

}

export const getRecommenderRvnuCode = async (req, res) => {

  const username = req.params.username
  
  const query = `SELECT AccountID, RvnuCodeID FROM RvnuAccount WHERE Username='${username}'`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}
