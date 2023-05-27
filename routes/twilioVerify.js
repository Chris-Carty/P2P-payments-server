import express from "express";
import {
  sendOtp,
  verifyOtp,
  verifyOtpSignUp,
  sendUsernameExpiry,
  sendCommissionSms,
} from "../controllers/twilioVerify.js";

const router = express.Router();

router.post("/sendOtp/:phoneNumber", sendOtp);
router.post("/verifyOtp/:inputOtp/:phoneNumber/:sessionId", verifyOtp);
router.post("/verifyOtpSignUp/:inputOtp/:phoneNumber", verifyOtpSignUp);
router.post(
  "/sendExpiry/:payerFirstname/:payerUsername/:payerNumber/:usernameExpiryDate",
  sendUsernameExpiry
);
router.post(
  "/commissionSms/:paymentId/:recommenderName/:recommenderNumber/:payerName/:payerUsername/:merchantName",
  sendCommissionSms
);

export default router;
