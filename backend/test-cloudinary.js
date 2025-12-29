require("dotenv").config();
const cloudinary = require("./utils/cloudinary").cloudinary;

async function testCloudinary() {
  console.log("🧪 Test de configuration Cloudinary...\n");

  // Test 1: Vérifier la configuration
  console.log("1. Configuration Cloudinary:");
  console.log(
    "   Cloud Name:",
    process.env.CLOUDINARY_CLOUD_NAME || "Non défini"
  );
  console.log(
    "   API Key:",
    process.env.CLOUDINARY_API_KEY ? "✓ Défini" : "✗ Non défini"
  );
  console.log(
    "   API Secret:",
    process.env.CLOUDINARY_API_SECRET ? "✓ Défini" : "✗ Non défini"
  );

  // Test 2: Tester la connexion
  try {
    const result = await cloudinary.api.ping();
    console.log("\n2. Test de connexion:");
    console.log("   ✅ Connecté à Cloudinary");
    console.log("   Status:", result.status);
  } catch (error) {
    console.log("\n2. Test de connexion:");
    console.log("   ❌ Erreur de connexion à Cloudinary");
    console.log("   Message:", error.message);
  }

  // Test 3: Vérifier les ressources existantes
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "chedjou-app/",
      max_results: 10,
    });
    console.log("\n3. Ressources existantes:");
    console.log("   Total:", result.resources.length);
    result.resources.forEach((res) => {
      console.log(`   - ${res.public_id} (${res.format})`);
    });
  } catch (error) {
    console.log("\n3. Ressources existantes:");
    console.log("   ❌ Impossible de récupérer les ressources");
    console.log("   Message:", error.message);
  }
}

testCloudinary();
