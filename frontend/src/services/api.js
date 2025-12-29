import axios from "axios";

// Configuration de base - UTILISEZ VOTRE URL RENDER
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://chedjou-app.onrender.com";

console.log(`🔧 Configuration API: ${API_BASE_URL}`);

// Créer l'instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Augmentez le timeout pour Render (30s)
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log simple pour le débogage
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error("❌ Erreur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Log détaillé des erreurs
    if (error.response) {
      console.error(
        `❌ ${error.response.status} ${error.config?.url}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error("❌ Pas de réponse du serveur:", error.message);
      console.log(
        "💡 Vérifiez que le backend est accessible: https://chedjou-app.onrender.com"
      );
    } else {
      console.error("❌ Erreur configuration:", error.message);
    }

    // Gestion spécifique des erreurs
    if (error.response?.status === 401) {
      console.warn("🔒 Session expirée - redirection vers login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Éviter la boucle infinie
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// API pour les activités
export const activityAPI = {
  getAll: () => api.get("/api/activities"), // AJOUTEZ /api POUR TOUTES LES ROUTES

  getById: (id) => api.get(`/api/activities/${id}`),

  create: (activityData, documentFile = null) => {
    const formData = new FormData();

    // Ajouter les champs de l'activité
    Object.keys(activityData).forEach((key) => {
      formData.append(key, activityData[key]);
    });

    // Ajouter le document si fourni
    if (documentFile) {
      formData.append("document", documentFile);
    }

    return api.post("/api/activities", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (id, activityData, documentFile = null) => {
    const formData = new FormData();

    Object.keys(activityData).forEach((key) => {
      formData.append(key, activityData[key]);
    });

    if (documentFile) {
      formData.append("document", documentFile);
    }

    return api.put(`/api/activities/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => api.delete(`/api/activities/${id}`),

  getTransactions: (activityId) =>
    api.get(`/api/activities/${activityId}/transactions`),

  getDocuments: (activityId) =>
    api.get(`/api/activities/${activityId}/documents`),
};

// API pour les transactions
export const transactionAPI = {
  create: (activityId, transactionData, documentFile = null) => {
    const formData = new FormData();

    Object.keys(transactionData).forEach((key) => {
      formData.append(key, transactionData[key]);
    });

    if (documentFile) {
      formData.append("document", documentFile);
    }

    return api.post(`/api/transactions/activity/${activityId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getAll: () => api.get("/api/transactions"),

  getById: (id) => api.get(`/api/transactions/${id}`),

  update: (id, transactionData, documentFile = null) => {
    const formData = new FormData();

    Object.keys(transactionData).forEach((key) => {
      formData.append(key, transactionData[key]);
    });

    if (documentFile) {
      formData.append("document", documentFile);
    }

    return api.put(`/api/transactions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => api.delete(`/api/transactions/${id}`),
};

// API pour l'authentification
export const authAPI = {
  login: (credentials) => api.post("/api/auth/login", credentials),

  register: (userData) => api.post("/api/auth/register", userData),

  // Ajoutez cette route si elle existe dans votre backend
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
};

// Fonction utilitaire simple pour vérifier la connexion
export const checkApiConnection = async () => {
  try {
    const response = await api.get("/api/health"); // AJOUTEZ /api
    return {
      connected: true,
      status: response.status,
      message: "API connectée avec succès",
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      message: "Impossible de se connecter à l'API",
    };
  }
};

export default api;
