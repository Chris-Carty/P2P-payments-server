import dotenv from 'dotenv'
import mssql from 'mssql'
import config from '../config/dbConfig.js'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Load environment variables into process.env
dotenv.config({ path: '../.env' }); 

const { connect, query } = mssql

export const login = async (req, res) => {
 
  const email = req.params.email
  const password = req.params.password

  try {
    await connect(config)
    const result = await query`SELECT Email, Password FROM RvnuAccount WHERE Email=${email}`
 
    if (result.recordset.length === 1 ) {

      const email_db =result.recordset[0].Email
      const hash = result.recordset[0].Password

      if (email === email_db && bcrypt.compareSync(password, hash)) {
        // create JWTs
        const accessToken = jwt.sign(
          { "email" : email },
          process.env.ACCESS_TOKEN_SECRET,
          {expiresIn: '30s'}
        )

        const refreshToken = jwt.sign(
          { "email" : email },
          process.env.REFRESH_TOKEN_SECRET,
          {expiresIn: '1d'}
        )
        // TODO..have differnt roles saved in DB
        // Each number in array represents different role
        const roles = [1, 2, 3]

        // TODO save Refresh token in DB and send as cookie in res
        // Valid for 1 day
        // res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000});
        
        res.json({ roles, accessToken }).status(200)
      } else {
        res.json(false).status(200)
      }
    } else {
      res.json(false).status(200)
    }

  } catch (err) {
    res.status(409).send({ message: err.message })
  }

}

export const forgotPassword = async (req, res) => {
 
  const email = req.params.email

  try {
    await connect(config)
    const result = await query`SELECT Email FROM RvnuAccount WHERE Email=${email}`
    const email_db =result.recordset[0].Email
    const hash = result.recordset[0].Password

    if (email === email_db && bcrypt.compareSync(password, hash)) {
      res.json(true).status(200)
    } else {
      res.json(false).status(200)
    }

  } catch (err) {
    res.status(409).send({ message: err.message })
  }

}

export const createRvnuAccount = async (req, res) => {

  // Generate unique Account ID 
  const accountId = randomUUID();
 
  const firstname = req.params.firstname
  const lastname = req.params.lastname
  const mobileNum = req.params.mobile
  const email = req.params.email
  const password = req.params.password
  const tlproviderId = req.params.providerId
  const accountNum = req.params.accountNum
  const sortcode = req.params.sortCode

  // HASH PASSWORD
  // salt should be created ONE TIME upon sign up
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  
  try {
    await connect(config)
    const result = await query`INSERT INTO RvnuAccount (AccountID, FirstName, LastName, MobileNumber, Email, Password, SortCode, AccountNumber, Tl_providerId, AccountCreated) VALUES (${accountId}, ${firstname}, ${lastname}, ${mobileNum}, ${email}, ${hash}, ${sortcode}, ${accountNum}, ${tlproviderId}, CURRENT_TIMESTAMP)`
    res.json("Successfully created RVNU Account").status(200)
  } catch (err) {
    res.status(409).send({ message: err.message })
  }

}

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

