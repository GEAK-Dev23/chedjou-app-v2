// MOD
//MOD
//MOD
const PORT = process.env.PORT || 5000;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Importer les routes
const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// CORRECTION : Middleware CORS simplifié pour Express 5
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://chedjou-app.vercel.app",
      "https://chedjou-app-git-main-gourlan-armels-projects.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

// SUPPRIMER la ligne problématique app.options("*", ...)
// Remplacée par le middleware CORS ci-dessus qui gère déjà OPTIONS

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/transactions", transactionRoutes);

// Route racine
app.get("/", (req, res) => {
  res.json({
    message: "API CHEDJOU APP - Backend opérationnel",
    version: "1.0.0",
    timestamp: new Date(),
    endpoints: {
      auth: "/api/auth",
      activities: "/api/activities",
      transactions: "/api/transactions",
      health: "/api/health",
      test: "/api/test",
      testEmail: "/api/test-email",
    },
    cors: {
      allowed_origins: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
      ],
    },
  });
});

// Route de test API
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API CHEDJOU APP - Test réussi",
    timestamp: new Date(),
    request: {
      origin: req.headers.origin || "non spécifié",
      method: req.method,
      ip: req.ip,
    },
    server: {
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
    },
    database: {
      status:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      name: mongoose.connection.name || "non connecté",
    },
    cors: {
      allowed: true,
      origin: req.headers.origin,
    },
  });
});

// Route de test SMTP
app.get("/api/test-email", async (req, res) => {
  try {
    const { testEmail } = require("./utils/email");
    const success = await testEmail();

    if (success) {
      res.json({ success: true, message: "Email de test envoyé avec succès" });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Échec envoi email de test" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Routes de santé (2 versions pour compatibilité)
app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
    },
    database: {
      status: statusMap[dbStatus] || "unknown",
      name: mongoose.connection.name || "N/A",
      readyState: dbStatus,
    },
    api: {
      version: "1.0.0",
      base_url: "/api",
      endpoints: [
        "/auth",
        "/activities",
        "/transactions",
        "/health",
        "/test",
        "/test-email",
      ],
    },
    cors: {
      enabled: true,
      origin: req.headers.origin || "non spécifié",
    },
  });
});

// Ancienne route santé (pour compatibilité)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date(),
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    note: "Utilisez /api/health pour la version complète",
    redirect_to: "/api/health",
  });
});

// Route de debug
app.get("/api/debug", (req, res) => {
  res.json({
    headers: req.headers,
    connection: {
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || 5000,
      EMAIL_HOST: process.env.EMAIL_HOST ? "Défini" : "Non défini",
      EMAIL_USER: process.env.EMAIL_USER ? "Défini" : "Non défini",
    },
  });
});

// Gestion des erreurs 404 - Déplacer AVANT les autres middlewares
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
    requested_url: req.originalUrl,
    available_endpoints: {
      root: "/",
      health: ["/health", "/api/health"],
      api: {
        auth: "/api/auth/*",
        activities: "/api/activities/*",
        transactions: "/api/transactions/*",
        test: "/api/test",
        testEmail: "/api/test-email",
        debug: "/api/debug",
      },
    },
  });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("🔥 Erreur serveur:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date(),
  });

  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    success: false,
    message: "Erreur interne du serveur",
    error: isDevelopment ? err.message : undefined,
    stack: isDevelopment ? err.stack : undefined,
    timestamp: new Date(),
    request_id: Date.now(),
  });
});

// Connexion MongoDB améliorée
const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;

  const connectWithRetry = async () => {
    try {
      const mongoURI =
        process.env.MONGODB_URI || "mongodb://localhost:27017/chedjou-app";

      console.log(
        `🔄 Tentative de connexion MongoDB (${retries + 1}/${maxRetries})...`
      );

      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log("✅ MongoDB connecté avec succès");
      console.log(`📊 Base de données: ${mongoose.connection.name}`);
      console.log(`📈 Hôte: ${mongoose.connection.host}`);
      console.log(`📉 Port: ${mongoose.connection.port}`);
    } catch (error) {
      retries++;
      console.error(
        `❌ Erreur de connexion MongoDB (tentative ${retries}):`,
        error.message
      );

      if (retries < maxRetries) {
        console.log(`⏳ Nouvelle tentative dans 5 secondes...`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error(
          "💥 Échec de connexion MongoDB après",
          maxRetries,
          "tentatives"
        );
        console.log("📝 Le serveur continuera sans base de données");
      }
    }
  };

  await connectWithRetry();
};

// Configuration du port
const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const server = app.listen(PORT, async () => {
  console.log(`
  🚀 CHEDJOU APP BACKEND
  ========================================
  📍 Port: ${PORT}
  🌐 URL: http://localhost:${PORT}
  🔗 API: http://localhost:${PORT}/api
  🕐 ${new Date().toLocaleString()}
  ========================================
  `);

  // Connexion à MongoDB
  await connectDB();

  console.log(`
  📋 ENDPOINTS DISPONIBLES
  ========================================
  🔐 AUTHENTIFICATION
    POST   /api/auth/register     - Inscription
    POST   /api/auth/login        - Connexion
    POST   /api/auth/forgot-password - Mot de passe oublié
    GET    /api/auth/profile      - Profil utilisateur

  🏢 ACTIVITÉS
    GET    /api/activities        - Liste activités
    POST   /api/activities        - Créer activité
    GET    /api/activities/:id    - Détail activité
    PUT    /api/activities/:id    - Modifier activité
    DELETE /api/activities/:id    - Supprimer activité

  💰 TRANSACTIONS
    GET    /api/transactions      - Liste transactions
    POST   /api/transactions/activity/:id - Ajouter transaction

  🩺 SANTÉ & DEBUG
    GET    /                      - Informations API
    GET    /health                - Santé (compatibilité)
    GET    /api/health            - Santé complète
    GET    /api/test              - Test de connexion
    GET    /api/test-email        - Test SMTP email
    GET    /api/debug             - Informations debug

  🌍 CORS
    Origines autorisées:
    - http://localhost:5173
    - http://localhost:5174
    - http://localhost:3000
  ========================================
  `);

  console.log("🔍 Vérification de l'accessibilité du serveur...");
  console.log("✅ Serveur prêt à recevoir des requêtes");
});

// Gestion propre de l'arrêt
process.on("SIGTERM", () => {
  console.log("👋 Arrêt du serveur...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 Arrêt du serveur (Ctrl+C)...");
  server.close(() => {
    console.log("✅ Serveur arrêté proprement");
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  console.error("💥 Erreur non capturée:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Promesse rejetée non gérée:", reason);
});

// Route santé pour Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "CHEDJOU APP API is running",
    timestamp: new Date(),
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur CHEDJOU APP démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
