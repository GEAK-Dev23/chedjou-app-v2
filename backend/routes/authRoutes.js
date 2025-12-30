// ✅ CORRECTION COMPLÈTE de authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Routes publiques
router.post("/register", authController.register);
router.post("/login", authController.login);

// ✅ AJOUT: Route mot de passe oublié
router.post("/forgot-password", authController.forgotPassword);

// Route protégée
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
