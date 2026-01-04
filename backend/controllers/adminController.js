// backend/controllers/adminController.js - NOUVEAU FICHIER
const User = require("../models/User");
const Activity = require("../models/Activity");
const { generateToken } = require("../utils/jwt");
const crypto = require("crypto");

// Créer un nouveau manager (ADMIN SEULEMENT)
exports.createManager = async (req, res) => {
  try {
    console.log("👤 Création d'un nouveau manager par admin:", req.user.userId);

    const { email, name } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }

    // Générer un mot de passe temporaire
    const tempPassword = crypto.randomBytes(8).toString("hex");

    // Créer le manager
    const manager = new User({
      email,
      name,
      passwordHash: tempPassword,
      role: "manager",
      createdBy: req.user.userId,
      isActive: true,
    });

    await manager.save();

    console.log(`✅ Manager créé: ${manager.email}`);

    res.status(201).json({
      success: true,
      message: "Manager créé avec succès",
      manager: {
        _id: manager._id,
        email: manager.email,
        name: manager.name,
        role: manager.role,
        tempPassword: tempPassword, // À envoyer par email en production
      },
    });
  } catch (error) {
    console.error("❌ Erreur création manager:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du manager",
      error: error.message,
    });
  }
};

// Liste de tous les managers (ADMIN SEULEMENT)
exports.getAllManagers = async (req, res) => {
  try {
    console.log("📋 Récupération de tous les managers");

    const managers = await User.find({
      role: "manager",
      createdBy: req.user.userId,
    })
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    // Compter les activités par manager
    const managersWithStats = await Promise.all(
      managers.map(async (manager) => {
        const activitiesCount = await Activity.countDocuments({
          userId: manager._id,
        });

        return {
          ...manager.toObject(),
          activitiesCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      managers: managersWithStats,
      total: managersWithStats.length,
    });
  } catch (error) {
    console.error("❌ Erreur récupération managers:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des managers",
      error: error.message,
    });
  }
};

// Désactiver/Activer un manager (ADMIN SEULEMENT)
exports.toggleManagerStatus = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await User.findOne({
      _id: managerId,
      role: "manager",
      createdBy: req.user.userId,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager non trouvé",
      });
    }

    manager.isActive = !manager.isActive;
    await manager.save();

    console.log(
      `✅ Manager ${manager.email} ${manager.isActive ? "activé" : "désactivé"}`
    );

    res.status(200).json({
      success: true,
      message: `Manager ${
        manager.isActive ? "activé" : "désactivé"
      } avec succès`,
      manager: {
        _id: manager._id,
        email: manager.email,
        name: manager.name,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error("❌ Erreur modification statut manager:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification du statut",
      error: error.message,
    });
  }
};

// Supprimer un manager (ADMIN SEULEMENT)
exports.deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await User.findOne({
      _id: managerId,
      role: "manager",
      createdBy: req.user.userId,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager non trouvé",
      });
    }

    // Vérifier si le manager a des activités
    const activitiesCount = await Activity.countDocuments({
      userId: managerId,
    });

    if (activitiesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Ce manager a ${activitiesCount} activité(s). Supprimez-les d'abord.`,
        activitiesCount,
      });
    }

    await User.deleteOne({ _id: managerId });

    console.log(`✅ Manager ${manager.email} supprimé`);

    res.status(200).json({
      success: true,
      message: "Manager supprimé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur suppression manager:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du manager",
      error: error.message,
    });
  }
};

// Statistiques globales (ADMIN SEULEMENT)
exports.getAdminStats = async (req, res) => {
  try {
    console.log("📊 Récupération des statistiques admin");

    // Compter les managers
    const totalManagers = await User.countDocuments({
      role: "manager",
      createdBy: req.user.userId,
    });

    const activeManagers = await User.countDocuments({
      role: "manager",
      createdBy: req.user.userId,
      isActive: true,
    });

    // Compter les activités totales
    const managers = await User.find({
      role: "manager",
      createdBy: req.user.userId,
    });

    const managerIds = managers.map((m) => m._id);

    const totalActivities = await Activity.countDocuments({
      userId: { $in: managerIds },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalManagers,
        activeManagers,
        inactiveManagers: totalManagers - activeManagers,
        totalActivities,
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération stats:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};
