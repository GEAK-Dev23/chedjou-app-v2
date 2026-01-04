// backend/routes/activityRoutes.js - VERSION AVEC RÔLES
const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const { adminOnly, authenticatedUsers } = require("../middleware/checkRole");

// Auth de base pour toutes les routes
router.use(auth);

// Routes accessibles par TOUS les utilisateurs authentifiés
router.get("/", authenticatedUsers, activityController.getAllActivities);
router.get("/:id", authenticatedUsers, activityController.getActivityById);
router.post(
  "/",
  upload.single("document"),
  authenticatedUsers,
  activityController.createActivity
);
router.put(
  "/:id",
  upload.single("document"),
  authenticatedUsers,
  activityController.updateActivity
);

// ✅ Route de suppression : ADMIN SEULEMENT
router.delete("/:id", adminOnly, activityController.deleteActivity);

// Routes spécifiques
router.get(
  "/:id/transactions",
  authenticatedUsers,
  activityController.getActivityTransactions
);
router.get(
  "/:id/documents",
  authenticatedUsers,
  activityController.getActivityDocuments
);

module.exports = router;
