// backend/controllers/activityController.js VERSION CORRIGÉE
const Activity = require("../models/Activity");
const Transaction = require("../models/Transaction");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Récupérer toutes les activités d'un utilisateur
exports.getAllActivities = async (req, res) => {
  try {
    console.log(`📋 Récupération des activités pour user: ${req.user.userId}`);

    const activities = await Activity.find({
      userId: req.user.userId,
      isArchived: false,
    }).sort({ createdAt: -1 });

    console.log(`✅ ${activities.length} activité(s) trouvée(s)`);

    // Calculer les totaux globaux
    let totalGains = 0;
    let totalExpenses = 0;

    for (const activity of activities) {
      // Récupérer les transactions de cette activité
      const transactions = await Transaction.find({ activityId: activity._id });

      console.log(
        `💰 Activité "${activity.name}": ${transactions.length} transaction(s)`
      );

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
    console.log(
      `🔍 Récupération activité ID: ${req.params.id} pour user: ${req.user.userId}`
    );

    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!activity) {
      console.log(`❌ Activité ${req.params.id} non trouvée`);
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    console.log(`✅ Activité trouvée: ${activity.name}`);

    // Récupérer les transactions associées
    const transactions = await Transaction.find({
      activityId: activity._id,
    }).sort({ date: -1 });

    console.log(`📊 ${transactions.length} transaction(s) trouvée(s)`);

    // Récupérer les documents
    const documents = [];

    // Document initial
    if (activity.initialDocumentUrl) {
      console.log(`📎 Document initial trouvé: ${activity.initialDocumentUrl}`);
      documents.push({
        id: "initial",
        name: "Document initial - " + activity.name,
        url: activity.initialDocumentUrl,
        date: activity.createdAt,
        type: "initial",
        size: "Document activité",
      });
    }

    // Documents des transactions
    const transactionsWithDocs = transactions.filter((t) => t.attachmentUrl);
    console.log(
      `📎 ${transactionsWithDocs.length} document(s) de transaction trouvé(s)`
    );

    transactionsWithDocs.forEach((trans) => {
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

    // Calculer les statistiques
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

    // Calculer le solde actuel
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

// Créer une nouvelle activité
exports.createActivity = async (req, res) => {
  try {
    console.log("📝 Création nouvelle activité...");
    console.log("📦 Données reçues:", req.body);
    console.log(
      "📎 Fichier reçu:",
      req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "Aucun"
    );

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

    // Upload du document si fourni
    if (req.file) {
      try {
        console.log("☁️ Upload vers Cloudinary...");
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/activities"
        );
        initialDocumentUrl = uploadResult.secure_url;
        console.log(`✅ Document uploadé: ${initialDocumentUrl}`);
      } catch (uploadError) {
        console.error("❌ Erreur upload Cloudinary:", uploadError);
        // Ne pas bloquer la création de l'activité si l'upload échoue
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
      balance: 0, // Initialiser à 0
    };

    console.log("💾 Sauvegarde activité...", activityData);

    const activity = new Activity(activityData);
    await activity.save();

    console.log(`✅ Activité créée avec ID: ${activity._id}`);

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
    console.log(`🔄 Mise à jour activité ID: ${req.params.id}`);
    console.log("📦 Données reçues:", req.body);
    console.log(
      "📎 Fichier reçu:",
      req.file ? `${req.file.originalname}` : "Aucun"
    );

    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!activity) {
      console.log(`❌ Activité ${req.params.id} non trouvée`);
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    const updates = req.body;

    // Upload du nouveau document si fourni
    if (req.file) {
      try {
        console.log("☁️ Upload nouveau document...");
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/activities"
        );
        updates.initialDocumentUrl = uploadResult.secure_url;
        console.log(`✅ Document uploadé: ${updates.initialDocumentUrl}`);
      } catch (uploadError) {
        console.error("❌ Erreur upload Cloudinary:", uploadError);
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

    // Mettre à jour location
    if (updates.city || updates.country) {
      activity.location = {
        city: updates.city || activity.location?.city,
        country: updates.country || activity.location?.country,
      };
    }

    // Mettre à jour contact
    if (updates.managerEmail || updates.managerPhone) {
      activity.contact = {
        email: updates.managerEmail || activity.contact?.email,
        phone: updates.managerPhone || activity.contact?.phone,
      };
    }

    await activity.save();
    console.log(`✅ Activité mise à jour: ${activity.name}`);

    // Recalculer le solde
    await calculateActivityBalance(activity._id);

    res.status(200).json({
      success: true,
      message: "Activité mise à jour avec succès",
      activity,
    });
  } catch (error) {
    console.error("❌ Erreur mise à jour activité:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'activité",
      error: error.message,
    });
  }
};

// Supprimer une activité (COMPLÈTE)
exports.deleteActivity = async (req, res) => {
  try {
    console.log(`🗑️ SUPPRESSION COMPLÈTE activité ID: ${req.params.id}`);

    // 1. VÉRIFIER que l'activité existe et appartient à l'utilisateur
    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!activity) {
      console.log(`❌ Activité ${req.params.id} non trouvée`);
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    const activityName = activity.name;
    const activityId = activity._id;

    // 2. SUPPRIMER TOUTES LES TRANSACTIONS LIÉES À CETTE ACTIVITÉ
    console.log(`🗑️ Recherche des transactions à supprimer...`);
    const transactionsToDelete = await Transaction.find({
      activityId: activityId,
      userId: req.user.userId,
    });

    console.log(
      `📝 ${transactionsToDelete.length} transaction(s) trouvée(s) à supprimer`
    );

    if (transactionsToDelete.length > 0) {
      const deleteResult = await Transaction.deleteMany({
        activityId: activityId,
        userId: req.user.userId,
      });
      console.log(
        `✅ ${deleteResult.deletedCount} transaction(s) supprimée(s)`
      );
    }

    // 3. SUPPRIMER L'ACTIVITÉ (VRAIMENT, pas d'archivage)
    await Activity.deleteOne({ _id: activityId, userId: req.user.userId });
    console.log(`✅ Activité "${activityName}" supprimée définitivement`);

    res.status(200).json({
      success: true,
      message: `Activité "${activityName}" et ses ${transactionsToDelete.length} transaction(s) supprimées définitivement`,
    });
  } catch (error) {
    console.error("❌ Erreur suppression activité:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'activité",
      error: error.message,
    });
  }
};

// Récupérer les transactions d'une activité
exports.getActivityTransactions = async (req, res) => {
  try {
    console.log(`📊 Récupération transactions activité ID: ${req.params.id}`);

    const transactions = await Transaction.find({
      activityId: req.params.id,
      userId: req.user.userId,
    }).sort({ date: -1 });

    console.log(`✅ ${transactions.length} transaction(s) trouvée(s)`);

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
    console.log(`📎 Récupération documents activité ID: ${req.params.id}`);

    const activity = await Activity.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!activity) {
      console.log(`❌ Activité ${req.params.id} non trouvée`);
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

    // Document initial
    if (activity.initialDocumentUrl) {
      console.log(`📎 Document initial: ${activity.initialDocumentUrl}`);
      documents.push({
        id: "initial",
        name: "Document initial - " + activity.name,
        url: activity.initialDocumentUrl,
        date: activity.createdAt,
        type: "initial",
        size: "Document activité",
      });
    }

    // Documents des transactions
    console.log(
      `📎 ${transactions.length} document(s) de transaction trouvé(s)`
    );
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

// Fonction helper pour calculer le solde d'une activité
async function calculateActivityBalance(activityId) {
  try {
    console.log(`🧮 Calcul du solde pour activité: ${activityId}`);

    const activity = await Activity.findById(activityId);
    if (!activity) {
      console.error("❌ Activité non trouvée pour calcul du solde");
      return 0;
    }

    const transactions = await Transaction.find({ activityId });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Ajouter le montant initial si c'est un gain
    const initialAmount = activity.initialAmount || 0;
    const initialContribution =
      activity.initialAmountType === "income" ? initialAmount : 0;
    const initialDeduction =
      activity.initialAmountType === "expense" ? initialAmount : 0;

    const newBalance =
      totalIncome + initialContribution - (totalExpense + initialDeduction);

    console.log(
      `💰 Calcul: ${totalIncome} (income) + ${initialContribution} (initial gain) - (${totalExpense} (expense) + ${initialDeduction} (initial expense)) = ${newBalance}`
    );

    // Mettre à jour le solde dans la base de données
    if (activity.balance !== newBalance) {
      activity.balance = newBalance;
      await activity.save();
      console.log(`✅ Solde mis à jour dans la base: ${newBalance}`);
    }

    return newBalance;
  } catch (error) {
    console.error("❌ Erreur calcul solde:", error);
    return 0;
  }
}
