import express from "express";
import {
  updateBankAccount,
  getUserBankAccount,
  getAccountId,
  checkExists,
  updateUsername,
  generateAccountId,
  updateTotalAssets,
  createAccount,
  getRecommenderAccount,
  getRecommender,
} from "../controllers/rvnuUser.js";
//import verifyJWT from '../middleware/'

const router = express.Router();

router.post(
  "/updateBankAccount/:userId/:providerId/:sortCode/:accountNum",
  updateBankAccount
);
router.get("/getUserBankAccount/:userId", getUserBankAccount);
router.get("/getAccountId/:num", getAccountId);
router.get("/checkExists/:num", checkExists);
router.get("/updateAssets/:accountId/:paymentId", updateTotalAssets);
router.post(
  "/createAccount/:name/:email/:phoneNumber/:dob",
  createAccount
);
router.post("/generateAccountId/:mobile/:sessionId", generateAccountId);
router.get("/recommender/account/:accountId", getRecommenderAccount);
router.post("/updateUsername/:username/:phoneNumber", updateUsername);
router.get(
  "/validateRecommender/:username/:sessionId/:clientId",
  getRecommender
);

export default router;
