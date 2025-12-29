// MOD
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Récupérer le token du header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Accès non autorisé. Token manquant.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Vérifier le token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "chedjou_app_secret_key_2025"
    );

    // Ajouter les infos utilisateur à la requête
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }
};

module.exports = authMiddleware;
