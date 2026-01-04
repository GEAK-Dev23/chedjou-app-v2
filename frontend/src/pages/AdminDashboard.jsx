// frontend/src/pages/AdminDashboard.jsx - NOUVEAU FICHIER
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const AdminDashboard = () => {
  const [managers, setManagers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newManager, setNewManager] = useState({ name: "", email: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger les managers
      const managersRes = await api.get("/api/admin/managers");
      setManagers(managersRes.data.managers || []);

      // Charger les stats
      const statsRes = await api.get("/api/admin/stats");
      setStats(statsRes.data.stats || {});
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/admin/managers", newManager);

      if (response.data.success) {
        alert(
          `✅ Manager créé!\n\nEmail: ${response.data.manager.email}\nMot de passe temporaire: ${response.data.manager.tempPassword}\n\n⚠️ Notez ce mot de passe!`
        );
        setNewManager({ name: "", email: "" });
        setShowCreateModal(false);
        loadData();
      }
    } catch (error) {
      alert("❌ Erreur: " + (error.response?.data?.message || error.message));
    }
  };

  const handleToggleStatus = async (managerId) => {
    try {
      await api.patch(`/api/admin/managers/${managerId}/toggle`);
      loadData();
    } catch (error) {
      alert("Erreur: " + error.response?.data?.message);
    }
  };

  const handleDeleteManager = async (managerId, name) => {
    if (!window.confirm(`Supprimer le manager ${name}?`)) return;

    try {
      await api.delete(`/api/admin/managers/${managerId}`);
      loadData();
    } catch (error) {
      alert("Erreur: " + error.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-textSecondary">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-inter font-bold text-textPrimary mb-2">
          <i className="fas fa-crown mr-3 text-primary"></i>
          Administration
        </h1>
        <p className="text-textSecondary">
          Gérez vos managers et surveillez les activités
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Total Managers</p>
              <p className="text-3xl font-bold text-primary">
                {stats.totalManagers || 0}
              </p>
            </div>
            <i className="fas fa-users text-4xl text-primary/20"></i>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Actifs</p>
              <p className="text-3xl font-bold text-success">
                {stats.activeManagers || 0}
              </p>
            </div>
            <i className="fas fa-user-check text-4xl text-success/20"></i>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Inactifs</p>
              <p className="text-3xl font-bold text-danger">
                {stats.inactiveManagers || 0}
              </p>
            </div>
            <i className="fas fa-user-slash text-4xl text-danger/20"></i>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm">Activités</p>
              <p className="text-3xl font-bold text-textPrimary">
                {stats.totalActivities || 0}
              </p>
            </div>
            <i className="fas fa-briefcase text-4xl text-primary/20"></i>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-textPrimary">
            <i className="fas fa-users mr-2"></i>
            Liste des Managers
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Créer un Manager
          </button>
        </div>
      </div>

      {/* Liste des managers */}
      <div className="card p-6">
        {managers.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-textSecondary mb-4"></i>
            <p className="text-textSecondary mb-4">Aucun manager créé</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Créer le premier manager
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Nom</th>
                <th className="table-header">Email</th>
                <th className="table-header">Activités</th>
                <th className="table-header">Statut</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager) => (
                <tr key={manager._id} className="hover:bg-background">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <i className="fas fa-user text-primary"></i>
                      </div>
                      <span className="font-medium">{manager.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">{manager.email}</td>
                  <td className="table-cell">
                    <span className="badge-primary">
                      {manager.activitiesCount || 0} activité(s)
                    </span>
                  </td>
                  <td className="table-cell">
                    {manager.isActive ? (
                      <span className="badge-success">
                        <i className="fas fa-check-circle mr-1"></i>
                        Actif
                      </span>
                    ) : (
                      <span className="badge-danger">
                        <i className="fas fa-ban mr-1"></i>
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleStatus(manager._id)}
                        className="text-primary hover:text-primary/80"
                        title={manager.isActive ? "Désactiver" : "Activer"}
                      >
                        <i
                          className={`fas fa-${
                            manager.isActive ? "ban" : "check-circle"
                          }`}
                        ></i>
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteManager(manager._id, manager.name)
                        }
                        className="text-danger hover:text-danger/80"
                        title="Supprimer"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Création Manager */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              <i className="fas fa-user-plus mr-2 text-primary"></i>
              Créer un Manager
            </h3>
            <form onSubmit={handleCreateManager}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={newManager.name}
                    onChange={(e) =>
                      setNewManager({ ...newManager, name: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newManager.email}
                    onChange={(e) =>
                      setNewManager({ ...newManager, email: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
