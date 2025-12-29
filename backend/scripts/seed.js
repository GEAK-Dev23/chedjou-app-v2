const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Activity = require("../models/Activity");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
require("dotenv").config();

async function seedDatabase() {
  try {
    console.log("🌱 Début du seeding...");

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connecté à MongoDB");

    // Créer ou récupérer l'utilisateur admin
    let user = await User.findOne({ email: "admin@chedjou.com" });

    if (!user) {
      // Créer l'utilisateur admin SEULEMENT s'il n'existe pas
      const hashedPassword = await bcrypt.hash("Chedjou2024!", 10);
      user = new User({
        email: "admin@chedjou.com",
        passwordHash: hashedPassword,
        name: "Admin CHEDJOU",
      });

      await user.save();
      console.log("✅ Utilisateur admin créé");

      // Vérifier si des activités existent déjà pour cet utilisateur
      const existingActivities = await Activity.find({ userId: user._id });

      // CRITIQUE : NE PAS créer de données de démo si l'utilisateur a déjà des activités
      if (existingActivities.length === 0) {
        console.log(
          "📝 Création des activités de démonstration (PREMIÈRE FOIS SEULEMENT)..."
        );

        const activities = [
          {
            name: "Boutique en ligne",
            description: "Vente de produits électroniques en ligne",
            manager: "Jean Dupont",
            sector: "E-commerce",
            defaultCurrency: "FCFA",
            location: { city: "Yaoundé", country: "Cameroun" },
            contact: {
              email: "jean.dupond@boutique.com",
              phone: "+237 6XX XXX XXX",
            },
            initialAmount: 500000,
            initialAmountType: "income",
            userId: user._id,
            balance: 500000,
          },
          {
            name: "Service de transport",
            description: "Transport urbain et interurbain",
            manager: "Marie Kameni",
            sector: "Transport",
            defaultCurrency: "FCFA",
            location: { city: "Douala", country: "Cameroun" },
            contact: {
              email: "marie@transport.com",
              phone: "+237 6XX XXX XXX",
            },
            initialAmount: 300000,
            initialAmountType: "income",
            userId: user._id,
            balance: 300000,
          },
        ];

        const savedActivities = await Activity.insertMany(activities);
        console.log(
          `✅ ${savedActivities.length} activités de démonstration créées`
        );

        // Créer quelques transactions de démonstration
        console.log("💰 Création des transactions de démonstration...");

        const transactions = [
          {
            type: "income",
            amount: 125000,
            category: "Vente",
            date: new Date(2025, 11, 25),
            description: "Vente heure sup",
            activityId: savedActivities[0]._id,
            userId: user._id,
          },
          {
            type: "expense",
            amount: 75000,
            category: "Matériel",
            date: new Date(2025, 11, 24),
            description: "Paiement fournisseur",
            activityId: savedActivities[0]._id,
            userId: user._id,
          },
          {
            type: "income",
            amount: 80000,
            category: "Course",
            date: new Date(2025, 11, 23),
            description: "Course Yaoundé-Douala",
            activityId: savedActivities[1]._id,
            userId: user._id,
          },
          {
            type: "expense",
            amount: 25000,
            category: "Carburant",
            date: new Date(2025, 11, 22),
            description: "Achat carburant",
            activityId: savedActivities[1]._id,
            userId: user._id,
          },
        ];

        await Transaction.insertMany(transactions);
        console.log(
          `✅ ${transactions.length} transactions de démonstration créées`
        );

        console.log(
          "🎉 Données de démonstration créées UNIQUEMENT lors de la première installation"
        );
      } else {
        console.log(
          `⚠️  ${existingActivities.length} activité(s) existante(s) - PAS de création de démo`
        );
        console.log(
          "   Le seed ne crée des données que pour les NOUVEAUX utilisateurs"
        );
      }
    } else {
      console.log("✅ Utilisateur admin existe déjà");
      console.log(
        "ℹ️  Pas de création de données de démo pour les utilisateurs existants"
      );
    }

    console.log("🎉 Seeding terminé avec succès");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    process.exit(1);
  }
}

// Exécuter le seeding
seedDatabase();
