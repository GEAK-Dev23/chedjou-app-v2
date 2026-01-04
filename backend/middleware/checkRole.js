// backend/middleware/checkRole.js - NOUVEAU FICHIER
const User = require("../models/User");

/**
 * Middleware pour vérifier le rôle d'un utilisateur
 * @param {string|string[]} allowedRoles - Rôle(s) autorisé(s)
 * @returns {Function} Middleware Express
 */
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Récupérer l'utilisateur complet depuis la DB
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé",
        });
      }

      // Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Votre compte a été désactivé. Contactez l'administrateur.",
        });
      }

      // Vérifier si le rôle est autorisé
      if (!allowedRoles.includes(user.role)) {
        console.log(
          `❌ Accès refusé: ${user.email} (${
            user.role
          }) tente d'accéder à une route ${allowedRoles.join("/")}`
        );
        return res.status(403).json({
          success: false,
          message: "Accès refusé. Permissions insuffisantes.",
          requiredRole: allowedRoles,
          userRole: user.role,
        });
      }

      // Ajouter le rôle et les infos complètes à la requête
      req.user.role = user.role;
      req.user.isAdmin = user.role === "admin";
      req.user.isManager = user.role === "manager";
      req.user.createdBy = user.createdBy;
      req.user.fullUser = user;

      console.log(`✅ Accès autorisé: ${user.email} (${user.role})`);
      next();
    } catch (error) {
      console.error("❌ Erreur vérification rôle:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification des permissions",
        error: error.message,
      });
    }
  };
};

/**
 * Middleware pour autoriser seulement les admins
 */
const adminOnly = checkRole("admin");

/**
 * Middleware pour autoriser admins et managers
 */
const authenticatedUsers = checkRole("admin", "manager");

module.exports = {
  checkRole,
  adminOnly,
  authenticatedUsers,
};
