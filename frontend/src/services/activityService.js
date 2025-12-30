// ✅ CORRECTION COMPLÈTE
import api, { activityAPI } from "./api";

export const activityService = {
  // Récupérer toutes les activités
  getAllActivities: async () => {
    try {
      const response = await activityAPI.getAll();
      return response.data;
    } catch (error) {
      console.error("Erreur getAllActivities:", error);
      throw error;
    }
  },

  // Récupérer une activité par ID
  getActivityById: async (id) => {
    try {
      const response = await activityAPI.getById(id);
      return response.data;
    } catch (error) {
      console.error("Erreur getActivityById:", error);
      throw error;
    }
  },

  // Créer une nouvelle activité
  createActivity: async (formData) => {
    try {
      // formData est déjà un FormData, on l'envoie directement
      const response = await activityAPI.create(formData);
      return response.data;
    } catch (error) {
      console.error("Erreur createActivity:", error);
      throw error;
    }
  },

  // Mettre à jour une activité
  updateActivity: async (id, activityData, file = null) => {
    try {
      const response = await activityAPI.update(id, activityData, file);
      return response.data;
    } catch (error) {
      console.error("Erreur updateActivity:", error);
      throw error;
    }
  },

  // Supprimer une activité
  deleteActivity: async (id) => {
    try {
      const response = await activityAPI.delete(id);
      return response.data;
    } catch (error) {
      console.error("Erreur deleteActivity:", error);
      throw error;
    }
  },

  // Récupérer les transactions d'une activité
  getActivityTransactions: async (activityId) => {
    try {
      const response = await activityAPI.getTransactions(activityId);
      return response.data;
    } catch (error) {
      console.error("Erreur getActivityTransactions:", error);
      throw error;
    }
  },

  // Récupérer les documents d'une activité
  getActivityDocuments: async (activityId) => {
    try {
      const response = await activityAPI.getDocuments(activityId);
      return response.data;
    } catch (error) {
      console.error("Erreur getActivityDocuments:", error);
      throw error;
    }
  },
};
