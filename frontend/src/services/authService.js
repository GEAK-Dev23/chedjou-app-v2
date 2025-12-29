import api from "./api";

export const authService = {
  // Inscription
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData); // AJOUTEZ /api
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Connexion
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials); // AJOUTEZ /api
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Mot de passe oublié
  forgotPassword: async (email) => {
    const response = await api.post("/api/auth/forgot-password", { email }); // AJOUTEZ /api
    return response.data;
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Vérifier si le token est expiré (version simplifiée)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  // Récupérer l'utilisateur courant
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Récupérer le token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Mettre à jour les informations utilisateur
  updateUser: (userData) => {
    const currentUser = authService.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return updatedUser;
  },
};
