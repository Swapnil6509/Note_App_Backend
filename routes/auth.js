const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  verifySignin,
  requestOTP,
  resendOTP
} = require("../controllers/authController");

// Signup routes
router.post("/signup", signup);

// Sign-in routes
router.post("/signin", signin);
router.post("/verify-signin", verifySignin);


router.post("/request-otp", requestOTP);
router.post("/resend-otp", resendOTP); 
module.exports = router;
