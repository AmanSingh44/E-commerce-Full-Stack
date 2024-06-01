const PasswordResetToken = require("../models/passwordResetToken");
const { isValidObjectId } = require("mongoose");
exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (
    !token ||
    typeof token !== "string" ||
    !token.trim() ||
    !isValidObjectId(userId)
  )
    return res.json({ error: "Invalid Request" });

  const resetToken = await PasswordResetToken.findOne({ owner: userId });
  if (!resetToken)
    return res
      .status(404)
      .json({ error: "Unauthorised access, Invalid Request" });

  const matched = await resetToken.compareToken(token);
  if (!matched)
    return res.json({ error: "Unauthorised access, Invalid Request" });

  req.resetToken = resetToken;
  next();
};
