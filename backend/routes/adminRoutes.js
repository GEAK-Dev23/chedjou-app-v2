// backend/routes/adminRoutes.js - NOUVEAU FICHIER
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const { adminOnly } = require("../middleware/checkRole");

// Toutes les routes nécessitent auth + rôle admin
router.use(auth);
router.use(adminOnly);

// Gestion des managers
router.post("/managers", adminController.createManager);
router.get("/managers", adminController.getAllManagers);
router.patch(
  "/managers/:managerId/toggle",
  adminController.toggleManagerStatus
);
router.delete("/managers/:managerId", adminController.deleteManager);

// Statistiques
router.get("/stats", adminController.getAdminStats);

module.exports = router;
