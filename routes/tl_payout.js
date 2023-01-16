import express from "express";
import {
  getAccessToken,
  initiateBusinessAccountPayout,
  //initiateMerchantPayout,
  getPayoutStatus,
} from "../controllers/tl_payout.js";

const router = express.Router();

router.post("/getAccessToken", getAccessToken);
router.post(
  "/business/:accessToken/:amount/:reference",
  initiateBusinessAccountPayout
);
//router.post('/merchant/:accessToken/:amount/:reference/:merchantId', initiateMerchantPayout)
router.get("/status/:accessToken/:paymentId", getPayoutStatus);

export default router;
