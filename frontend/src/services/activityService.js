import api from "./api";

export const activityService = {
  // Récupérer toutes les activités
  getAllActivities: async () => {
    try {
      const response = await api.get("/activities");
      return response.data;
    } catch (error) {
      console.error("Erreur récupération activités:", error);
      return {
        success: false,
        activities: [],
        totals: { gains: 0, expenses: 0, profit: 0 },
      };
    }
  },

  // Récupérer une activité par ID
  getActivityById: async (id) => {
    try {
      const response = await api.get(`/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération activité:", error);
      return { success: false, activity: null };
    }
  },

  // Créer une activité
  createActivity: async (formData) => {
    try {
      const response = await api.post("/activities", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur création activité:", error);
      throw error;
    }
  },

  // Mettre à jour une activité
  updateActivity: async (id, formData) => {
    try {
      const response = await api.put(`/activities/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur mise à jour activité:", error);
      throw error;
    }
  },

  // Supprimer une activité
  deleteActivity: async (id) => {
    try {
      const response = await api.delete(`/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur suppression activité:", error);
      throw error;
    }
  },

  // Récupérer les transactions d'une activité
  getActivityTransactions: async (id) => {
    try {
      const response = await api.get(`/activities/${id}/transactions`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération transactions:", error);
      return { success: false, transactions: [] };
    }
  },

  // Récupérer les documents d'une activité
  getActivityDocuments: async (id) => {
    try {
      const response = await api.get(`/activities/${id}/documents`);
      return response.data;
    } catch (error) {
      console.error("Erreur récupération documents:", error);
      return { success: false, documents: [] };
    }
  },
};
