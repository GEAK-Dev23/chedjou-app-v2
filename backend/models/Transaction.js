// MOD
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Type de transaction est requis"],
      enum: ["income", "expense"],
      lowercase: true,
    },
    amount: {
      type: Number,
      required: [true, "Montant est requis"],
      min: [0, "Le montant ne peut pas être négatif"],
    },
    category: {
      type: String,
      required: [true, "Catégorie est requise"],
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour les requêtes fréquentes
transactionSchema.index({ activityId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ date: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
