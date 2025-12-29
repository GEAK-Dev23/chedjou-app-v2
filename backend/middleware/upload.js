const multer = require("multer");
const path = require("path");

// Configuration de multer pour stocker en mémoire
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Vérifier l'extension du fichier
  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".svg",
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté: ${ext}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

module.exports = upload;
