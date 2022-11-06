import conn from '../config/dbConfig.js'
import { randomUUID } from 'crypto'

export const generateRvnuCode = async (req, res) => {
  // Generates a new RVNU code for a user

  // Generate unique RVNUcode ID 
  const rvnuCodeId = randomUUID();
  // Generate unique RVNUcode 
  const rvnuCode = randomUUID().substring(0, 6);
  // User who new RVNU code is for
  const userId = req.params.userId

  // Insert new RVNUcode in RvnuCode table
  // AND link this RVNUcode to a user account
  const query = `INSERT INTO RvnuCode (RvnuCodeID, RvnuCode, DateGenerated, Expiry) VALUES (${rvnuCodeId}, ${rvnuCode}, CURRENT_TIMESTAMP, DATEADD(month,1,CURRENT_TIMESTAMP)) ; UPDATE RvnuAccount SET RvnuCodeID = ${rvnuCodeId} WHERE AccountID = ${userId}`

  conn.query(query, function (err, data, fields) {
    if(err) return res.status(409).send({ message: err.message })
    res.status(200).json({data});
  });

}

export const getUserRvnuExpiry = async (req, res) => {
  // Identifies if the user has a valid RVNUcode or needs a new one
  const rvnuCodeId = req.params.rvnuCodeId

  const query = `SELECT Expiry FROM RvnuCode WHERE RvnuCodeID='${rvnuCodeId}'`

  conn.query(query, function (err, data, fields) {
    if(err) return res.status(409).send({ message: err.message })
    res.status(200).json({data});
  });

}
