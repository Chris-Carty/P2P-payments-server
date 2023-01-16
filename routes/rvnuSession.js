import express from "express";
import {
  createSession,
  validateSession,
  updateMobile,
  updateNewUser,
  getNewUser,
  updateVerified,
  linkAccountToSession,
  getMerchantRedirectUri,
} from "../controllers/rvnuSession.js";
const router = express.Router();

router.post("/create/:clientId/:accountId/:rvnuPaymentId", createSession);
router.get("/validate/:sessionId/:rvnuPaymentId", validateSession);
router.post("/mobile/:sessionId/:mobileNumber", updateMobile);
router.post("/newUser/:sessionId/:mobileNumber/:bool", updateNewUser);
router.get("/newUserStatus/:sessionId/", getNewUser);
router.post("/verified/:sessionId/:mobileNumber", updateVerified);
router.get("/linkAccount/:mobile/:sessionId", linkAccountToSession);
router.get("/merchantRedirect/:trueLayerPaymentId", getMerchantRedirectUri);

export default router;
