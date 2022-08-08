import conn from '../config/dbConfig.js'

export const getName = async (req, res) => {
  // Gets users first name
  const mobileNumber = req.params.num
  
  const query = "SELECT FirstName FROM RvnuAccount WHERE MobileNumber ='"+ mobileNumber +"' LIMIT 1"

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

export const getUserRvnuAccount = async (req, res) => {
  // Gets users RVNU account info
  const mobileNumber = req.params.num
  
  const query = "SELECT AccountID, FirstName, LastName, MobileNumber, SortCode, AccountNumber, Tl_providerId, RvnuCodeID FROM RvnuAccount WHERE MobileNumber ='"+ mobileNumber +"' LIMIT 1"

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
  
  const query = "SELECT AccountNumber, Tl_providerId FROM RvnuAccount WHERE AccountID ='"+ userId +"'"

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

export const getUserWhosCodeRvnuUsed = async (req, res) => {
  // Get RVNU account info of the user whos RVNUcode is used to checkout
  // This will be used to send SMS and email notifications
  const rvnuCodeId = req.params.rvnuCodeId
  
  const query = "SELECT AccountID, FirstName, MobileNumber, Email FROM RvnuAccount WHERE RvnuCodeID ='"+ rvnuCodeId +"' LIMIT 1"

  try {
    conn.query(query, (err, data) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json({data});
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

export const updateTotalAssets = async (req, res) => {

  // Get commission earned from the transaction 
  // query 1
  // Updates a users TotalAssetsOwed && TotalAssets
  const accountId = req.params.accountId
  const paymentId = req.params.paymentId
  const rvnuCodeId = req.params.rvnuCodeId

  const query = "UPDATE RvnuAccount SET TotalAssetsOwed = '"+ sortCode +"', AccountNumber = '"+ accountNum +"', Tl_providerId = '"+ providerId +"'WHERE AccountID = '"+ accountId +"'"

  try {
    conn.query(query, (err) => {
      if(err) return res.status(409).send({ message: err.message })
      res.status(200).json("Successfully updated user total assets");
    });
  } catch (err) {
      res.status(409).send({ message: err.message })
  }
}

