const express = require("express");
const {
  register,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
  resetPassword,
  signIn,
} = require("../controller/user-controller");
const {
  userValidator,
  validate,
  validatePassword,
  signInValidator,
} = require("../middlewares/validator");
const { isAuth } = require("../middlewares/auth");
const router = express.Router();

router.post("/register", userValidator, validate, register);
router.post("/signin", signInValidator, validate, signIn);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification-token", resendEmailVerificationToken);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", validate, validatePassword, resetPassword);

router.get("/is-auth", isAuth, async (req, res) => {
  const { user } = req;

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      role: user.role,
    },
  });
});

module.exports = router;
