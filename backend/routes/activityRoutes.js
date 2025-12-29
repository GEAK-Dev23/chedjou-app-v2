const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les activités
router.get("/", activityController.getAllActivities);
router.get("/:id", activityController.getActivityById);
router.post("/", upload.single("document"), activityController.createActivity);
router.put(
  "/:id",
  upload.single("document"),
  activityController.updateActivity
);
router.delete("/:id", activityController.deleteActivity);

// Routes spécifiques
router.get("/:id/transactions", activityController.getActivityTransactions);
router.get("/:id/documents", activityController.getActivityDocuments);

module.exports = router;
