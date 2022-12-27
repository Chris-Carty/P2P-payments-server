import dotenv from 'dotenv'
import conn from '../config/dbConfig.js'
import { v4 as uuidv4 } from 'uuid';

// Load environment variables into process.env
dotenv.config({ path: '../.env' }); 

export const createAccount = async (req, res) => {

  // Generate unique Account ID 
  const accountId = uuidv4();
  // Account Info
  const firstname = req.params.firstname
  const lastname = req.params.lastname
  const username = req.params.username
  const mobile = req.params.mobile
  const dob = req.params.dob
  const accountNum = req.params.accountNum
  const sortCode = req.params.sortCode
  const providerId = req.params.providerId

  const query = `INSERT INTO RvnuAccount (AccountID, FirstName, LastName, DoB, MobileNumber, Username, SortCode, AccountNumber, Tl_providerId, AccountCreated) VALUES ( '${accountId}', '${firstname}', '${lastname}', '${dob}', '${mobile}', '${username}', '${sortCode}', '${accountNum}', '${providerId}', CURRENT_TIMESTAMP)`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }
}

export const generateAccountId = async (req, res) => {

  // Generate unique Account ID 
  const accountId = uuidv4();
  // Account Info
  const payerName = req.params.payerName
  const firstname = payerName.split(' ')[0]
  const lastname = payerName.split(' ')[1]
  const mobile = req.params.mobile

  const query = `INSERT INTO RvnuAccount (AccountID, FirstName, LastName, MobileNumber, AccountCreated) VALUES ( '${accountId}', '${firstname}', '${lastname}', '${mobile}', CURRENT_TIMESTAMP)`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}


export const getAccountId = async (req, res) => {

  const mobileNumber = req.params.num
  
  const query = `SELECT AccountID FROM RvnuAccount WHERE MobileNumber=${mobileNumber}`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}


export const getRvnuAccount = async (req, res) => {
  // Gets users preferred payment account
  const mobileNumber = req.params.num
  
  const query = `SELECT AccountID, FirstName, LastName, MobileNumber, Username, Tl_providerId, RvnuCodeID FROM RvnuAccount WHERE MobileNumber=${mobileNumber}`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

// Check if RVNU username entered has valid username associated with it
export const getRecommenderAccount = async (req, res) => {
  // Gets users preferred payment account
  const accountID = req.params.accountId
  
  const query = `SELECT FirstName, LastName, MobileNumber, Username, Email FROM RvnuAccount WHERE AccountID='${accountID}'`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

// Check if RVNU username exists when signing up
export const getUsername = async (req, res) => {

  const username = req.params.username
  
  const query = `SELECT 1 FROM RvnuAccount WHERE Username='${username}'`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
          res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}


export const getUserBankAccount = async (req, res) => {
  // Gets users preferred payment account
  const userId = req.params.userId
  
  const query = `SELECT AccountID, FirstName, MobileNumber, Email FROM RvnuAccount WHERE RvnuCodeID =${rvnuCodeId}`

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

export const updateBankAccount = async (req, res) => {
  // Updates a users preferred payment account
  const userId = req.params.userId
  const providerId = req.params.providerId
  const sortCode = req.params.sortCode
  const accountNum = req.params.accountNum

  const query = "UPDATE RvnuAccount SET SortCode = '"+ sortCode +"', AccountNumber = '"+ accountNum +"', Tl_providerId = '"+ providerId +"'WHERE AccountID = '"+ userId +"'"

  try {
    conn.query(query, (err) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json("Successfully updated user bank account");
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }
}

export const updateTotalAssets = async (req, res) => {

  // Get commission earned from the transaction 
  // Updates a users TotalAssetsOwed && TotalAssets
  const accountId = req.params.accountId
  const paymentId = req.params.paymentId


  const query = `SELECT RecommenderCommission, RecommenderAssetsUpdated FROM RvnuTransaction WHERE PaymentID='${paymentId}' AND RecommenderID='${accountId}'`

  try {

    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })

      Object.keys(data).forEach(function(key) {
        var row = data[key];
        const commission = row.RecommenderCommission
        const assetsPrevUpdated = row.RecommenderAssetsUpdated

        // Safety measure to ensure commission isn't paid out more than once for the same transaction.
        if (assetsPrevUpdated === 0) {

          const query = `UPDATE RvnuAccount SET TotalAssetsOwed = TotalAssetsOwed + '${commission}', TotalAssets = TotalAssets + '${commission}' WHERE AccountID ='${accountId}'`


          try {
            conn.query(query, (err, data) => {
              if(err) return res.status(409).send({ message: err.message })

              const query = `UPDATE RvnuTransaction SET RecommenderAssetsUpdated = '${1}' WHERE PaymentID ='${paymentId}'`

              try {
                conn.query(query, (err, data) => {
                  if(err) return res.status(409).send({ message: err.message })
                  res.status(200).json({data});
          
              });
              } catch (err) {
                  res.status(409).send({ message: err.message })
              }
      
          });
          } catch (err) {
              res.status(409).send({ message: err.message })
          }

        }

    });
  });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}
