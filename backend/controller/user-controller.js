const User = require("../models/user");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP } = require("../utils/mail");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.status(401).json({ error: "This email is already in use" });
  }
  const newUser = new User({ name, email, password });
  await newUser.save();

  //generating 6 digit OTP
  let OTP = generateOTP();

  //store OTP inside database
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send otp to user
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe76195695bed",
      pass: "56b03a7882315e",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
         <p>Your Verification OTP</p>
         <h1>${OTP}</h1>
     
       `,
  });

  res.status(201).json({ newUser });
};

const verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId)) {
    return res.json({ error: "Invalid User" });
  }
  const user = await User.findById(userId);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  if (user.isVerified) {
    return res.json({ error: "User is already verified" });
  }

  const token = await EmailVerificationToken.findOne({ owner: userId });
  if (!token) {
    return res.json({ error: "Token not found" });
  }

  const isMatched = await token.compareToken(OTP);
  if (!isMatched) {
    return res.json({ error: "Please submit a valid OTP" });
  }
  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe76195695bed",
      pass: "56b03a7882315e",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Welcome Email",
    html: "<h1>Welcome to our App</h1>",
  });

  const jwtToken = jwt.sign({ userId: user._id }, "jsflksjflksfjljsasf");

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      token: jwtToken,
      isVerified: user.isVerified,
      role: user.role,
    },
    message: "Your email is verified",
  });
};

const resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return res.json({ error: "User not found" });
  }
  if (user.isVerified) {
    return res.json({ error: "User is already verified" });
  }
  const alreadyHasToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (alreadyHasToken) {
    return res.json({
      error: "You can request for another token after 2 minutes",
    });
  }

  //generating 6 digit OTP
  let OTP = generateOTP();

  //store OTP inside database
  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  //send otp to user
  var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe76195695bed",
      pass: "56b03a7882315e",
    },
  });

  transport.sendMail({
    from: "verification@reviewapp.com",
    to: user.email,
    subject: "Email Verification",
    html: `
        <p>Your Verification OTP</p>
        <h1>${OTP}</h1>
    
      `,
  });

  res.status(201).json({
    message: "New OTP has been sent to your email",
  });
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ error: "Email is missing" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=id=${user._id}`;

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe76195695bed",
      pass: "56b03a7882315e",
    },
  });

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
        <p>Click here to reset password</p>
        <a href='${resetPasswordUrl}'>Change Password</a>
    
      `,
  });
  res.json({ message: "Link sent to your email" });
};

const resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  if (!isValidObjectId(userId)) {
    return res.json({ error: "Invalid User" });
  }

  const user = await User.findById(userId);
  const matched = await user.comparePassword(newPassword);
  if (matched)
    return res.json({
      error: "The new password must be different from the old one",
    });

  user.password = newPassword;
  await user.save();

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "cfe76195695bed",
      pass: "56b03a7882315e",
    },
  });

  transport.sendMail({
    from: "security@reviewapp.com",
    to: user.email,
    subject: "Password reset sucessfully",
    html: `
        <h1>Password reset sucessfully</h1>
    
      `,
  });
  res.json({ message: "Password changed sucessfully" });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ error: "Email or password mismatch" });

  const matched = await user.comparePassword(password);
  if (!matched) return res.json({ error: "Email or password mismatch" });

  const { _id, name, role, isVerified } = user;

  const jwtToken = jwt.sign({ userId: _id }, "jsflksjflksfjljsasf");

  res.json({
    user: { id: _id, name, email, role, token: jwtToken, isVerified },
  });
};

module.exports = {
  register,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
  resetPassword,
  signIn,
};
