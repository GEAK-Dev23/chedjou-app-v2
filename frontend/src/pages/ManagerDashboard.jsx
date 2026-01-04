// frontend/src/pages/ManagerDashboard.jsx - NOUVEAU FICHIER (Optionnel)
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityAPI } from "../services/api";
import { authService } from "../services/authService";

const ManagerDashboard = () => {
  const [activity, setActivity] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const response = await activityAPI.getAll();

      if (response.data.success && response.data.activities.length > 0) {
        const myActivity = response.data.activities[0];
        setActivity(myActivity);

        // Charger les stats de l'activité
        const detailResponse = await activityAPI.getById(myActivity._id);
        if (detailResponse.data.success) {
          setStats(detailResponse.data.stats || {});
        }
      }
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `${Number(amount || 0).toLocaleString()} FCFA`;
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

  if (!activity) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6">
            <i className="fas fa-briefcase text-4xl text-blue-600"></i>
          </div>

          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            Aucune activité
          </h2>

          <p className="text-textSecondary mb-8">
            Vous n'avez pas encore d'activité assignée.
            <br />
            Créez votre première activité pour commencer.
          </p>

          <Link
            to="/activities/new"
            className="btn-primary inline-flex items-center"
          >
            <i className="fas fa-plus mr-2"></i>
            Créer mon activité
          </Link>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">
              <i className="fas fa-info-circle mr-2"></i>
              <strong>Note:</strong> En tant que manager, vous ne pouvez gérer
              qu'une seule activité à la fois.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-inter font-bold text-textPrimary mb-2">
              <i className="fas fa-user-tie mr-3 text-blue-600"></i>
              Mon Activité
            </h1>
            <p className="text-textSecondary">
              Bienvenue, {user?.name} - Vue d'ensemble de votre activité
            </p>
          </div>

          <Link to={`/activities/${activity._id}`} className="btn-primary">
            <i className="fas fa-eye mr-2"></i>
            Voir les détails
          </Link>
        </div>
      </div>

      {/* Carte Activité */}
      <div className="card p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-2">
              {activity.name}
            </h2>
            <p className="text-textSecondary mb-4">{activity.description}</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-textSecondary mr-2"></i>
                <span>
                  {activity.location?.city}, {activity.location?.country}
                </span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-industry text-textSecondary mr-2"></i>
                <span>{activity.sector || "Non spécifié"}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-money-bill-wave text-textSecondary mr-2"></i>
                <span>{activity.defaultCurrency}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="badge-success text-lg px-4 py-2">
              <i className="fas fa-check-circle mr-2"></i>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm mb-1">Total Gains</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <i className="fas fa-arrow-up text-4xl text-success/20"></i>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm mb-1">Total Dépenses</p>
              <p className="text-2xl font-bold text-danger">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <i className="fas fa-arrow-down text-4xl text-danger/20"></i>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-sm mb-1">Solde Actuel</p>
              <p
                className={`text-2xl font-bold ${
                  stats.currentBalance >= 0 ? "text-success" : "text-danger"
                }`}
              >
                {formatCurrency(stats.currentBalance)}
              </p>
            </div>
            <i className="fas fa-wallet text-4xl text-primary/20"></i>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to={`/activities/${activity._id}`}
          className="card p-6 hover:shadow-lg transition-shadow text-center"
        >
          <i className="fas fa-eye text-3xl text-primary mb-3"></i>
          <h3 className="font-semibold text-textPrimary">Voir l'activité</h3>
        </Link>

        <Link
          to={`/activities/${activity._id}/edit`}
          className="card p-6 hover:shadow-lg transition-shadow text-center"
        >
          <i className="fas fa-edit text-3xl text-blue-600 mb-3"></i>
          <h3 className="font-semibold text-textPrimary">Modifier</h3>
        </Link>

        <Link
          to="/transactions/new"
          className="card p-6 hover:shadow-lg transition-shadow text-center"
        >
          <i className="fas fa-plus-circle text-3xl text-success mb-3"></i>
          <h3 className="font-semibold text-textPrimary">Transaction</h3>
        </Link>

        <Link
          to="/documents"
          className="card p-6 hover:shadow-lg transition-shadow text-center"
        >
          <i className="fas fa-folder-open text-3xl text-textSecondary mb-3"></i>
          <h3 className="font-semibold text-textPrimary">Documents</h3>
        </Link>
      </div>

      {/* Avertissement Manager */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <i className="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Information Manager
            </h4>
            <p className="text-sm text-blue-800">
              En tant que manager, vous pouvez gérer uniquement cette activité.
              Pour supprimer l'activité ou en créer une nouvelle, contactez
              l'administrateur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
