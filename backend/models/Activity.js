//MOD
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nom de l'activité est requis"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    manager: {
      type: String,
      required: [true, "Responsable est requis"],
      trim: true,
    },
    sector: {
      type: String,
      trim: true,
    },
    defaultCurrency: {
      type: String,
      default: "FCFA",
      enum: ["FCFA", "EUR", "USD", "XAF"],
    },
    location: {
      city: String,
      country: String,
    },
    contact: {
      email: String,
      phone: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    initialAmount: {
      type: Number,
      default: 0,
    },
    initialAmountType: {
      type: String,
      enum: ["income", "expense", "none"],
      default: "none",
    },
    initialDocumentUrl: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
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

// Index pour améliorer les performances
activitySchema.index({ userId: 1, isArchived: 1 });
activitySchema.index({ name: "text", description: "text" });

// Middleware pour calculer le solde initial
activitySchema.pre("save", function (next) {
  if (this.initialAmount && this.initialAmountType === "income") {
    this.balance = this.initialAmount;
  } else if (this.initialAmount && this.initialAmountType === "expense") {
    this.balance = -this.initialAmount;
  }
  next();
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
