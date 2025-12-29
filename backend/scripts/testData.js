const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Activity = require("../models/Activity");
const Transaction = require("../models/Transaction");

const testDatabase = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/chedjou-app"
    );
    console.log("✅ Connecté à MongoDB");

    // Compter les utilisateurs
    const userCount = await User.countDocuments();
    console.log(`👤 Nombre d'utilisateurs: ${userCount}`);

    // Compter les activités
    const activityCount = await Activity.countDocuments();
    console.log(`🏢 Nombre d'activités: ${activityCount}`);

    // Compter les transactions
    const transactionCount = await Transaction.countDocuments();
    console.log(`💰 Nombre de transactions: ${transactionCount}`);

    // Afficher les 5 dernières activités
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name manager balance createdAt");

    console.log("\n📋 Dernières activités:");
    recentActivities.forEach((activity, index) => {
      console.log(
        `${index + 1}. ${activity.name} - ${activity.manager} - ${
          activity.balance
        } FCFA`
      );
    });

    // Tester un utilisateur
    const testUser = await User.findOne();
    if (testUser) {
      console.log(`\n👤 Utilisateur test: ${testUser.email}`);
    } else {
      console.log(
        "\n⚠️  Aucun utilisateur trouvé. Créez-en un via l'interface web."
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur test base de données:", error);
    process.exit(1);
  }
};

testDatabase();
