//VEC
const Transaction = require("../models/Transaction");
const Activity = require("../models/Activity");
const { uploadToCloudinary } = require("../utils/cloudinary");

// Créer une transaction
exports.createTransaction = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { type, amount, category, date, description } = req.body;

    // Vérifier que l'activité appartient à l'utilisateur
    const activity = await Activity.findOne({
      _id: activityId,
      userId: req.user.userId,
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activité non trouvée",
      });
    }

    let attachmentUrl = null;

    // Upload du document si fourni
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/transactions"
        );
        attachmentUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Erreur upload Cloudinary:", uploadError);
      }
    }

    const transactionData = {
      type,
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      description,
      attachmentUrl,
      activityId,
      userId: req.user.userId,
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    // Mettre à jour le solde de l'activité
    await updateActivityBalance(activityId);

    res.status(201).json({
      success: true,
      message: "Transaction créée avec succès",
      transaction,
    });
  } catch (error) {
    console.error("Erreur création transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la transaction",
      error: error.message,
    });
  }
};

// Récupérer toutes les transactions d'un utilisateur
exports.getAllTransactions = async (req, res) => {
  try {
    console.log(`📊 Récupération transactions pour user: ${req.user.userId}`);

    const transactions = await Transaction.find({
      userId: req.user.userId,
    })
      .populate({
        path: "activityId",
        select: "name",
        match: { userId: req.user.userId }, // S'assurer que l'activité existe encore
      })
      .sort({ date: -1 });

    console.log(`✅ ${transactions.length} transaction(s) brute(s) trouvée(s)`);

    // FILTRER les transactions dont l'activité a été supprimée
    const validTransactions = transactions.filter((t) => t.activityId !== null);

    console.log(
      `📈 ${validTransactions.length} transaction(s) valide(s) après filtrage`
    );

    res.status(200).json({
      success: true,
      transactions: validTransactions, // Retourne seulement les valides
    });
  } catch (error) {
    console.error("Erreur récupération transactions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des transactions",
      error: error.message,
    });
  }
};

// Récupérer une transaction par ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    }).populate("activityId", "name");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Erreur récupération transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de la transaction",
      error: error.message,
    });
  }
};

// Mettre à jour une transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    const updates = req.body;

    // Upload du nouveau document si fourni
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "chedjou-app/transactions"
        );
        updates.attachmentUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Erreur upload Cloudinary:", uploadError);
      }
    }

    // Mettre à jour les champs
    Object.keys(updates).forEach((key) => {
      if (
        updates[key] !== undefined &&
        key !== "_id" &&
        key !== "activityId" &&
        key !== "userId"
      ) {
        transaction[key] = updates[key];
      }
    });

    await transaction.save();

    // Mettre à jour le solde de l'activité
    await updateActivityBalance(transaction.activityId);

    res.status(200).json({
      success: true,
      message: "Transaction mise à jour avec succès",
      transaction,
    });
  } catch (error) {
    console.error("Erreur mise à jour transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la transaction",
      error: error.message,
    });
  }
};

// Supprimer une transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    const activityId = transaction.activityId;
    await transaction.deleteOne();

    // Mettre à jour le solde de l'activité
    await updateActivityBalance(activityId);

    res.status(200).json({
      success: true,
      message: "Transaction supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur suppression transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la transaction",
      error: error.message,
    });
  }
};

// Fonction helper pour mettre à jour le solde d'une activité
async function updateActivityBalance(activityId) {
  try {
    const activity = await Activity.findById(activityId);
    if (!activity) return;

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

    activity.balance =
      totalIncome + initialContribution - (totalExpense + initialDeduction);
    await activity.save();
  } catch (error) {
    console.error("Erreur mise à jour solde:", error);
  }
}
