const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  verifySignin,
  requestOTP
} = require("../controllers/authController");

// Signup routes
router.post("/signup", signup);

// Sign-in routes
router.post("/signin", signin);
router.post("/verify-signin", verifySignin);

// (Optional) Old OTP routes if you still need them
router.post("/request-otp", requestOTP);

module.exports = router;
