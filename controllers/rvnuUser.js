import mssql from 'mssql'
import config from '../config/dbConfig.js'

const { connect, query } = mssql

export const getName = async (req, res) => {
  // Gets users first name
  const mobileNumber = req.params.num
  
  try {
    await connect(config)
    const result = await query`SELECT FirstName FROM RvnuAccount WHERE MobileNumber=${mobileNumber}`
    res.json(result.recordset).status(200)
  } catch (err) {
    res.status(409).send({ message: err.message })
  }

}

export const getUserRvnuAccount = async (req, res) => {
  // Gets users RVNU account info
  const mobileNumber = req.params.num
  
  try {
    await connect(config)
    const result = await query`SELECT AccountID, FirstName, LastName, MobileNumber, SortCode, AccountNumber, Tl_providerId, RvnuCodeID FROM RvnuAccount WHERE MobileNumber=${mobileNumber}`
    res.json(result.recordset).status(200)
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

export const getUserBankAccount = async (req, res) => {
  // Gets users preferred payment account
  const userId = req.params.userId

  try {
    await connect(config)
    const result = await query`SELECT AccountNumber, Tl_providerId FROM RvnuAccount WHERE AccountID =${userId}`
    res.json(result.recordset).status(200)
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

    try {
      await connect(config)
      const result = await query`UPDATE RvnuAccount SET SortCode = ${sortCode}, AccountNumber = ${ accountNum}, Tl_providerId = ${providerId} WHERE AccountID = ${userId}`
      res.json("Successfully updated user bank account").status(200)
    } catch (err) {
        res.status(409).send({ message: err.message })
    }
}

export const getUserWhosCodeRvnuUsed = async (req, res) => {
  // Get RVNU account info of the user whos RVNUcode is used to checkout
  // This will be used to send SMS and email notifications
  const rvnuCodeId = req.params.rvnuCodeId

  try {
    await connect(config)
    const result = await query`SELECT AccountID, FirstName, MobileNumber, Email FROM RvnuAccount WHERE RvnuCodeID =${rvnuCodeId}`
    res.json(result.recordset).status(200)
  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

export const updateTotalAssets = async (req, res) => {

  // Get commission earned from the transaction 
  // Updates a users TotalAssetsOwed && TotalAssets
  const accountId = req.params.accountId
  const paymentId = req.params.paymentId
  const rvnuCodeId = req.params.rvnuCodeId

  try {
    await connect(config)
    const result = await query`SELECT UserCommission FROM RvnuTransaction WHERE PaymentID=${paymentId} AND RvnuCodeID=${rvnuCodeId}`
    const commission = result.recordset[0].UserCommission
    
    try {
      await connect(config)
      const result = await query`UPDATE RvnuAccount SET TotalAssetsOwed = TotalAssetsOwed + ${commission}, TotalAssets = TotalAssets + ${commission} WHERE AccountID = ${accountId} AND RvnuCodeID=${rvnuCodeId}`
    } catch (err) {
        res.status(409).send({ message: err.message })
    }

  } catch (err) {
      res.status(409).send({ message: err.message })
  }

}

