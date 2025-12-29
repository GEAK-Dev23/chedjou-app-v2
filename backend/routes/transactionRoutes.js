const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");

// Toutes les routes nécessitent une authentification
router.use(auth);

// Routes pour les transactions
router.post(
  "/activity/:activityId",
  upload.single("document"),
  transactionController.createTransaction
);
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransactionById);
router.put(
  "/:id",
  upload.single("document"),
  transactionController.updateTransaction
);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
