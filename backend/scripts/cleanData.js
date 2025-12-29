const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
require("dotenv").config();

async function cleanData() {
  try {
    console.log("🧹 Nettoyage des données...");

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connecté à MongoDB");

    // Trouver l'utilisateur
    const user = await User.findOne({ email: "admin@chedjou.com" });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      process.exit(1);
    }

    // Compter les données existantes
    const activitiesCount = await Activity.countDocuments({ userId: user._id });
    const transactionsCount = await Transaction.countDocuments({
      userId: user._id,
    });

    console.log("📊 Données existantes:");
    console.log(`   Activités: ${activitiesCount}`);
    console.log(`   Transactions: ${transactionsCount}`);

    if (activitiesCount === 0 && transactionsCount === 0) {
      console.log("✅ Aucune donnée à supprimer");
      process.exit(0);
    }

    // Demander confirmation (sauf si --force est utilisé)
    const force = process.argv.includes("--force");

    if (!force) {
      console.log(
        "\n⚠️  ATTENTION: Cela va supprimer TOUTES vos activités et transactions."
      );
      console.log("   Pour continuer, ajoutez --force à la commande:");
      console.log("   node scripts/cleanData.js --force");
      console.log("\n   Pour annuler: Ctrl+C");

      // Attendre 5 secondes avant de sortir
      setTimeout(() => {
        console.log("\n❌ Opération annulée par précaution");
        process.exit(0);
      }, 5000);

      return;
    }

    // Supprimer les données
    console.log("\n🗑️  Suppression des données...");

    const deletedActivities = await Activity.deleteMany({ userId: user._id });
    const deletedTransactions = await Transaction.deleteMany({
      userId: user._id,
    });

    console.log(
      `✅ ${deletedActivities.deletedCount} activité(s) supprimée(s)`
    );
    console.log(
      `✅ ${deletedTransactions.deletedCount} transaction(s) supprimée(s)`
    );

    console.log("\n🎉 Nettoyage terminé!");
    console.log(
      "👉 Vous pouvez maintenant relancer l'application sans les données de démonstration"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage:", error);
    process.exit(1);
  }
}

cleanData();
