import conn from '../config/dbConfig.js'
import { randomUUID } from 'crypto'

export const generateRvnuCode = async (req, res) => {
  // Generates a new RVNU code for a user

  // Generate unique RVNUcode ID 
  const rvnuCodeId = randomUUID();
  // Generate unique RVNUcode ID 
  const rvnuCode = randomUUID().substring(0, 6);
  // User who new RVNU code is for
  const userId = req.params.userId

  // Insert new RVNUcode in RvnuCode table
  // AND link this RVNUcode to a user account
  const query = "INSERT INTO RvnuCode (RvnuCodeID, RvnuCode, DateGenerated, Expiry) VALUES ('"+ rvnuCodeId + "', '" + rvnuCode + "', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH)) ; UPDATE RvnuAccount SET RvnuCodeID = '"+ rvnuCodeId +"'WHERE AccountID = '"+ userId +"'"

  
  try {
    conn.query(query, [2,1], (err) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({ 'RvnuCodeID': rvnuCodeId});
    
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}


export const verifyRvnuCode = async (req, res) => {
  // Verifies that the RVNUCode entered is valid or expired
  const rvnuCode = req.params.rvnuCode

  const query = "SELECT RvnuCodeID FROM RvnuCode WHERE RvnuCode='" + rvnuCode + "' LIMIT 1"

  conn.query(query, function (err, data, fields) {
    if(err) return res.status(409).send({ message: err.message })
    res.status(200).json({data});
  });

}

export const getUserRvnuCode = async (req, res) => {
  // Identifies if the user has a valid RVNUcode or needs a new one
  const rvnuCodeId = req.params.rvnuCodeId

  const query = "SELECT RvnuCode, Expiry FROM RvnuCode WHERE RvnuCodeID='" + rvnuCodeId + "' AND Expiry >= CURDATE() LIMIT 1"

  conn.query(query, function (err, data, fields) {
    if(err) return res.status(409).send({ message: err.message })
    res.status(200).json({data});
  });

}

export const identifyUser = async (req, res) => {
  // Identifies the user who a RVNUCode belongs to
  const rvnuCode = req.params.rvnuCode

}