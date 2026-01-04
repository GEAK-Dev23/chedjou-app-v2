//MOD
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/email");

// ✅ MODIFIER la fonction register pour gérer le rôle
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    // ✅ Par défaut, les inscriptions publiques sont des managers
    const user = new User({
      email,
      passwordHash: password,
      name,
      role: "manager", // ✅ AJOUTER
      createdBy: null,
      isActive: true,
    });

    await user.save();

    // Générer le token JWT
    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role, // ✅ AJOUTER
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

// ✅ MODIFIER la fonction login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // ✅ Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte a été désactivé. Contactez l'administrateur.",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = generateToken(user._id);

    // ✅ Retourner la réponse AVEC le rôle
    const userResponse = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role, // ✅ AJOUTER
      createdAt: user.createdAt,
    };

    console.log(`✅ Connexion réussie: ${user.email} (${user.role})`);

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: error.message,
    });
  }
};

// Mot de passe oublié
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir une adresse email.",
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouvé avec cette adresse email.",
      });
    }

    // Générer un nouveau mot de passe aléatoire (12 caractères)
    const newPassword = crypto.randomBytes(12).toString("hex");

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe de l'utilisateur
    user.password = hashedPassword;
    await user.save();

    // Envoyer l'email avec le nouveau mot de passe
    try {
      await sendPasswordResetEmail(user.email, user.name, newPassword);

      console.log("✅ Mot de passe réinitialisé pour:", user.email);

      res.status(200).json({
        success: true,
        message:
          "Un nouveau mot de passe a été généré et envoyé à votre adresse email.",
        // NE PAS ENVOYER LE MOT DE PASSE DANS LA RÉPONSE EN PRODUCTION
        // newPassword: newPassword, // À RETIRER EN PRODUCTION
      });
    } catch (emailError) {
      console.error("❌ Erreur envoi email:", emailError);

      // Annuler la modification du mot de passe si l'email échoue
      user.password = user.previousPassword || user.password;
      await user.save();

      res.status(500).json({
        success: false,
        message:
          "Le nouveau mot de passe a été généré, mais l'envoi de l'email a échoué. Veuillez contacter l'administrateur.",
      });
    }
  } catch (error) {
    console.error("❌ Erreur réinitialisation mot de passe:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
      error: error.message,
    });
  }
};
