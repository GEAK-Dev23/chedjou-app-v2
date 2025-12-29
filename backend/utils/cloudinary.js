const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configuration Cloudinary avec variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Vérifier la configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn("⚠️  Variables Cloudinary manquantes dans .env");
  console.warn("   Les uploads de fichiers ne fonctionneront pas correctement");
} else {
  console.log("✅ Cloudinary configuré avec succès");
}

// Upload de fichier
const uploadToCloudinary = (buffer, folder = "chedjou-app") => {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("Aucun buffer fourni"));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        allowed_formats: [
          "jpg",
          "jpeg",
          "png",
          "pdf",
          "doc",
          "docx",
          "xls",
          "xlsx",
          "txt",
          "svg",
        ],
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) {
          console.error("❌ Erreur Cloudinary upload:", error.message);
          reject(error);
        } else {
          console.log("✅ Fichier uploadé vers Cloudinary:", {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes,
          });
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Supprimer un fichier
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("❌ Erreur suppression Cloudinary:", error);
        reject(error);
      } else {
        console.log("✅ Fichier supprimé de Cloudinary:", publicId);
        resolve(result);
      }
    });
  });
};

// Extraire l'ID public d'une URL Cloudinary
const extractPublicId = (url) => {
  if (!url) return null;

  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const publicId = filename.split(".")[0];
    const folder = parts[parts.length - 2];

    return folder ? `${folder}/${publicId}` : publicId;
  } catch (error) {
    console.error("❌ Erreur extraction public_id:", error);
    return null;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  cloudinary,
};
