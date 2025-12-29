//MOD
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || "chedjou_app_secret_key_2025",
    { expiresIn: "7d" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET || "chedjou_app_secret_key_2025"
    );
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
