// backend/controllers/activityController.js - VERSION COMPLÈTE AVEC RÔLES
const Activity = require("../models/Activity");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Récupérer toutes les activités selon le rôle
exports.getAllActivities = async (req, res) => {
  try {
    console.log(
      `📋 Récupération activités pour ${req.user.role}: ${req.user.userId}`
    );

    let query = { isArchived: false };

    // ADMIN : Voit TOUTES les activités de ses managers
    if (req.user.role === "admin") {
      const managers = await User.find({
        role: "manager",
        createdBy: req.user.userId,
      });
      const managerIds = managers.map((m) => m._id);
      query.userId = { $in: managerIds };
    }
    // MANAGER : Voit UNIQUEMENT SES activités
    else {
      query.userId = req.user.userId;
    }

    const activities = await Activity.find(query)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    console.log(`✅ ${activities.length} activité(s) trouvée(s)`);

    // Calculer les totaux globaux
    let totalGains = 0;
    let totalExpenses = 0;

    for (const activity of activities) {
      const transactions = await Transaction.find({ activityId: activity._id });

      const incomeSum = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenseSum = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      totalGains +=
        incomeSum +
        (activity.initialAmountType === "income" ? activity.initialAmount : 0);
      totalExpenses +=
        expenseSum +
        (activity.initialAmountType === "expense" ? activity.initialAmount : 0);
    }

    res.status(200).json({
      success: true,
      activities,
      userRole: req.user.role,
      totals: {
        gains: totalGains,
        expenses: totalExpenses,
        profit: totalGains - totalExpenses,
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération activités:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des activités",
      error: error.message,
    });
  }
};

// Récupérer une activité par ID
exports.getActivityById = async (req, res) => {
  try {
    console.log(`🔍 Récupération activité ID: ${req.params.id}`);

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    // Vérifier les permissions
    if (
      req.user.role === "manager" &&
      activity.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez voir que votre propre activité",
      });
    }

    // Récupérer les transactions
    const transactions = await Transaction.find({
      activityId: activity._id,
    }).sort({ date: -1 });

    // Documents
    const documents = [];
    if (activity.initialDocumentUrl) {
      documents.push({
        id: "initial",
        name: "Document initial - " + activity.name,
        url: activity.initialDocumentUrl,
        date: activity.createdAt,
        type: "initial",
        size: "Document activité",
      });
    }

    transactions
      .filter((t) => t.attachmentUrl)
      .forEach((trans) => {
        documents.push({
          id: trans._id,
          name: `Document transaction - ${
            trans.description || "Sans description"
          }`,
          url: trans.attachmentUrl,
          date: trans.date,
          type: "transaction",
          amount: trans.amount,
          category: trans.category,
          size: "Document transaction",
        });
      });

    // Statistiques
    const totalIncome =
      transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0) +
      (activity.initialAmountType === "income" ? activity.initialAmount : 0);

    const totalExpense =
      transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0) +
      (activity.initialAmountType === "expense" ? activity.initialAmount : 0);

    const currentBalance = await calculateActivityBalance(activity._id);

    res.status(200).json({
      success: true,
      activity,
      transactions,
      documents,
      stats: {
        totalIncome,
        totalExpense,
        currentBalance,
      },
    });
  } catch (error) {
    console.error("❌ Erreur récupération activité:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'activité",
      error: error.message,
    });
  }
};

// Créer une activité
exports.createActivity = async (req, res) => {
  try {
    console.log(
      `📝 Création activité par ${req.user.role}: ${req.user.userId}`
    );

    // MANAGER : Vérifier qu'il n'a pas déjà une activité
    if (req.user.role === "manager") {
      const existingActivity = await Activity.findOne({
        userId: req.user.userId,
        isArchived: false,
      });

      if (existingActivity) {
        return res.status(400).json({
          success: false,
          message:
            "Vous avez déjà une activité active. Contactez l'administrateur pour en créer une autre.",
          existingActivity: {
            name: existingActivity.name,
            id: existingActivity._id,
          },
        });
      }
    }

    const {
      name,
      description,
      manager,
      sector,
      defaultCurrency,
      city,
      country,
      managerEmail,
      managerPhone,
      initialAmount,
      initialAmountType,
    } = req.body;

    let initialDocumentUrl = null;

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/activities"
        );
        initialDocumentUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("❌ Erreur upload:", uploadError);
      }
    }

    const activityData = {
      name,
      description,
      manager,
      sector,
      defaultCurrency: defaultCurrency || "FCFA",
      location: { city, country },
      contact: { email: managerEmail, phone: managerPhone },
      userId: req.user.userId,
      initialAmount: parseFloat(initialAmount) || 0,
      initialAmountType: initialAmountType || "none",
      initialDocumentUrl,
      balance: 0,
    };

    const activity = new Activity(activityData);
    await activity.save();

    console.log(`✅ Activité créée: ${activity._id} par ${req.user.role}`);

    res.status(201).json({
      success: true,
      message: "Activité créée avec succès",
      activity,
    });
  } catch (error) {
    console.error("❌ Erreur création activité:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'activité",
      error: error.message,
    });
  }
};

// Mettre à jour une activité
exports.updateActivity = async (req, res) => {
  try {
    console.log(`📄 Mise à jour activité ID: ${req.params.id}`);

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    // Vérifier les permissions
    if (
      req.user.role === "manager" &&
      activity.userId.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez modifier que votre propre activité",
      });
    }

    const updates = req.body;

    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/activities"
        );
        updates.initialDocumentUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("❌ Erreur upload:", uploadError);
      }
    }

    // Mettre à jour les champs
    if (updates.name !== undefined) activity.name = updates.name;
    if (updates.description !== undefined)
      activity.description = updates.description;
    if (updates.manager !== undefined) activity.manager = updates.manager;
    if (updates.sector !== undefined) activity.sector = updates.sector;
    if (updates.defaultCurrency !== undefined)
      activity.defaultCurrency = updates.defaultCurrency;
    if (updates.initialAmount !== undefined)
      activity.initialAmount = parseFloat(updates.initialAmount) || 0;
    if (updates.initialAmountType !== undefined)
      activity.initialAmountType = updates.initialAmountType;
    if (updates.initialDocumentUrl !== undefined)
      activity.initialDocumentUrl = updates.initialDocumentUrl;

    if (updates.city || updates.country) {
      activity.location = {
        city: updates.city || activity.location?.city,
        country: updates.country || activity.location?.country,
      };
    }

    if (updates.managerEmail || updates.managerPhone) {
      activity.contact = {
        email: updates.managerEmail || activity.contact?.email,
        phone: updates.managerPhone || activity.contact?.phone,
      };
    }

    await activity.save();
    await calculateActivityBalance(activity._id);

    console.log(`✅ Activité mise à jour: ${activity.name}`);

    res.status(200).json({
      success: true,
      message: "Activité mise à jour avec succès",
      activity,
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error.message,
    });
  }
};

// Supprimer une activité (ADMIN SEULEMENT)
exports.deleteActivity = async (req, res) => {
  try {
    console.log(`🗑️ Suppression activité: ${req.params.id}`);

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    // MANAGER : Refuser
    if (req.user.role === "manager") {
      return res.status(403).json({
        success: false,
        message:
          "Vous ne pouvez pas supprimer une activité. Contactez l'administrateur.",
        contactAdmin: true,
      });
    }

    // ADMIN : Vérifier que c'est une activité de ses managers
    const manager = await User.findById(activity.userId);
    if (
      manager &&
      manager.createdBy &&
      manager.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Vous ne pouvez pas supprimer cette activité",
      });
    }

    // Supprimer transactions
    const deletedTransactions = await Transaction.deleteMany({
      activityId: activity._id,
    });

    // Supprimer activité
    await Activity.deleteOne({ _id: activity._id });

    console.log(`✅ Activité "${activity.name}" supprimée`);

    res.status(200).json({
      success: true,
      message: `Activité et ${deletedTransactions.deletedCount} transaction(s) supprimées`,
    });
  } catch (error) {
    console.error("❌ Erreur suppression:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error.message,
    });
  }
};

// Récupérer les transactions d'une activité
exports.getActivityTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      activityId: req.params.id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("❌ Erreur récupération transactions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des transactions",
      error: error.message,
    });
  }
};

// Récupérer les documents d'une activité
exports.getActivityDocuments = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    const transactions = await Transaction.find({
      activityId: activity._id,
      attachmentUrl: { $exists: true, $ne: null },
    });

    const documents = [];

    if (activity.initialDocumentUrl) {
      documents.push({
        id: "initial",
        name: "Document initial - " + activity.name,
        url: activity.initialDocumentUrl,
        date: activity.createdAt,
        type: "initial",
        size: "Document activité",
      });
    }

    transactions.forEach((trans) => {
      documents.push({
        id: trans._id,
        name: `Document - ${
          trans.description || "Transaction sans description"
        }`,
        url: trans.attachmentUrl,
        date: trans.date,
        type: "transaction",
        amount: trans.amount,
        category: trans.category,
        size: "Document transaction",
      });
    });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("❌ Erreur récupération documents:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des documents",
      error: error.message,
    });
  }
};

// Fonction helper
async function calculateActivityBalance(activityId) {
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) return 0;

    const transactions = await Transaction.find({ activityId });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const initialAmount = activity.initialAmount || 0;
    const initialContribution =
      activity.initialAmountType === "income" ? initialAmount : 0;
    const initialDeduction =
      activity.initialAmountType === "expense" ? initialAmount : 0;

    const newBalance =
      totalIncome + initialContribution - (totalExpense + initialDeduction);

    if (activity.balance !== newBalance) {
      activity.balance = newBalance;
      await activity.save();
    }

    return newBalance;
  } catch (error) {
    console.error("❌ Erreur calcul solde:", error);
    return 0;
  }
}
