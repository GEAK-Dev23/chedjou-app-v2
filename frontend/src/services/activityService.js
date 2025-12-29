import api from "./api";

export const activityService = {
  // Récupérer toutes les activités
  getAll: async () => {
    const response = await api.get("/api/activities"); // AJOUTEZ /api
    return response.data;
  },

  // Récupérer une activité par ID
  getById: async (id) => {
    const response = await api.get(`/api/activities/${id}`); // AJOUTEZ /api
    return response.data;
  },

  // Créer une nouvelle activité
  create: async (activityData, file = null) => {
    const formData = new FormData();

    Object.keys(activityData).forEach((key) => {
      formData.append(key, activityData[key]);
    });

    if (file) {
      formData.append("document", file);
    }

    const response = await api.post("/api/activities", formData, {
      // AJOUTEZ /api
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Mettre à jour une activité
  update: async (id, activityData, file = null) => {
    const formData = new FormData();

    Object.keys(activityData).forEach((key) => {
      formData.append(key, activityData[key]);
    });

    if (file) {
      formData.append("document", file);
    }

    const response = await api.put(`/api/activities/${id}`, formData, {
      // AJOUTEZ /api
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Supprimer une activité
  delete: async (id) => {
    const response = await api.delete(`/api/activities/${id}`); // AJOUTEZ /api
    return response.data;
  },

  // Récupérer les transactions d'une activité
  getTransactions: async (activityId) => {
    const response = await api.get(
      `/api/activities/${activityId}/transactions`
    ); // AJOUTEZ /api
    return response.data;
  },

  // Récupérer les documents d'une activité
  getDocuments: async (activityId) => {
    const response = await api.get(`/api/activities/${activityId}/documents`); // AJOUTEZ /api
    return response.data;
  },
};
