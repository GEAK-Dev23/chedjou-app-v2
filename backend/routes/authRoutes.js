//MOD
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Route publique: Inscription
router.post("/register", authController.register);

// Route publique: Connexion
router.post("/login", authController.login);

// Route protégée: Profil utilisateur
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
