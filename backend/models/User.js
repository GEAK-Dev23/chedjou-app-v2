// backend/models/User.js - VERSION AVEC RÔLES
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email est requis"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir un email valide"],
    },
    passwordHash: {
      type: String,
      required: [true, "Mot de passe est requis"],
    },
    name: {
      type: String,
      required: [true, "Nom est requis"],
      trim: true,
    },
    // ✅ NOUVEAU : Rôle de l'utilisateur
    role: {
      type: String,
      enum: ["admin", "manager"],
      default: "manager",
      required: true,
    },
    // ✅ NOUVEAU : Référence à l'admin qui a créé ce manager
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // ✅ NOUVEAU : Statut actif/inactif
    isActive: {
      type: Boolean,
      default: true,
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
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdBy: 1 });

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Méthode pour vérifier si l'utilisateur est admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Méthode pour vérifier si l'utilisateur est manager
userSchema.methods.isManager = function () {
  return this.role === "manager";
};

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
