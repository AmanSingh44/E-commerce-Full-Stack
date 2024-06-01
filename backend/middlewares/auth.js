const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuth = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ error: "Invalid Token!" });
  const jwtToken = token.split("Bearer ")[1];

  if (!jwtToken) return res.json({ error: "Invalid Token!" });
  const decode = jwt.verify(jwtToken, "jsflksjflksfjljsasf");
  const { userId } = decode;

  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ error: "Invalid token user not found" });

  req.user = user;
  next();
};

exports.isAdmin = (req, res, next) => {
  const { user } = req;
  if (user.role !== "admin") return res.json({ error: "Unauthoried access!!" });

  next();
};
