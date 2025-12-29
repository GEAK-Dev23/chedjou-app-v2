// VEC
import { testApiConnection } from "../services/api";

export const initializeApp = async () => {
  console.log("Initialisation de l'application...");

  // Tester la connexion API
  const apiTest = await testApiConnection();
  console.log("Test connexion API:", apiTest);

  if (!apiTest.connected) {
    console.error(
      "❌ API non accessible. Vérifiez que le backend est démarré."
    );
    console.log("💡 Astuce: Lancez le backend avec: cd backend && yarn dev");
    return false;
  }

  console.log("✅ API connectée avec succès");

  // Vérifier l'authentification
  const token = localStorage.getItem("token");
  if (token) {
    console.log("✅ Utilisateur authentifié");
  } else {
    console.log("ℹ️  Utilisateur non authentifié");
  }

  return true;
};
