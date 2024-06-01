const nodemailer = require("nodemailer");

exports.generateOTP = (otp_length = 6) => {
  //generating 6 digit OTP
  let OTP = "";
  for (let i = 1; i <= otp_length; i++) {
    const randomVal = Math.round(Math.random() * 9);
    OTP += randomVal;
  }
  return OTP;
};
