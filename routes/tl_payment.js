import express from "express";
import {
  generatePaymentLink,
  validatePayment,
  getPaymentStatus,
  getPaymentInfoForClient,
  getSuccessfulPaymentInfo,
} from "../controllers/tl_payment.js";

const router = express.Router();

router.post(
  "/generatePaymentLink/:client_id/:payment_request_id/:sessionId",
  generatePaymentLink
);
router.get("/status/:truelayerPaymentId", getPaymentStatus);
router.get("/validate/:clientId/:rvnuPaymentId", validatePayment);
router.get("/saleInfo/:clientId/:rvnuPaymentId", getPaymentInfoForClient);
router.get("/success/:trueLayerPaymentId", getSuccessfulPaymentInfo);

export default router;
