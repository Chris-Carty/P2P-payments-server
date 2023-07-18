import express from "express";
import {
  generatePaymentLink,
  getPaymentStatus,
} from "../controllers/tl_payment.js";

const router = express.Router();

router.post(
  "/generatePaymentLink/:paymentAmount/:payerEmail/:payerName",
  generatePaymentLink
);
router.get("/status/:truelayerPaymentId", getPaymentStatus);

export default router;
