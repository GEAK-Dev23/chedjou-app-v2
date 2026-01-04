// backend/scripts/createAdmin.js - NOUVEAU FICHIER
const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    console.log("👑 Création du premier administrateur...");

    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️  Un administrateur existe déjà:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nom: ${existingAdmin.name}`);

      const response = await new Promise((resolve) => {
        const readline = require("readline").createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        readline.question(
          "Voulez-vous en créer un autre? (oui/non): ",
          (answer) => {
            readline.close();
            resolve(answer.toLowerCase() === "oui");
          }
        );
      });

      if (!response) {
        console.log("❌ Opération annulée");
        process.exit(0);
      }
    }

    // Données du nouvel admin
    const adminData = {
      email: "admin@chedjou.com",
      name: "Administrateur Principal",
      passwordHash: "Admin2024!", // Sera hashé automatiquement
      role: "admin",
      createdBy: null,
      isActive: true,
    };

    // Créer l'admin
    const admin = new User(adminData);
    await admin.save();

    console.log("✅ Administrateur créé avec succès!");
    console.log("┌─────────────────────────────────────┐");
    console.log("│   INFORMATIONS DE CONNEXION         │");
    console.log("├─────────────────────────────────────┤");
    console.log(`│ Email:    ${adminData.email.padEnd(23)}│`);
    console.log(`│ Password: Admin2024!                │`);
    console.log(`│ Rôle:     ${adminData.role.padEnd(27)}│`);
    console.log("└─────────────────────────────────────┘");
    console.log("");
    console.log(
      "⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

createAdmin();
