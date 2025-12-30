import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityAPI } from "../services/api";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les activités
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getAll();

      if (response.data.success) {
        setActivities(response.data.activities || []);
      } else {
        throw new Error(response.data.message || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("❌ Erreur chargement activités:", error);
      setError(error.message || "Impossible de charger les activités");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une activité
  // Supprimer une activité
  const handleDeleteActivity = async (id, name) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'activité "${name}" ? CETTE ACTION EST IRREVERSIBLE ET SUPPRIMERA TOUTES LES TRANSACTIONS ASSOCIÉES.`
      )
    ) {
      return;
    }

    try {
      const response = await activityAPI.delete(id);

      if (response.data.success) {
        alert("✅ Activité et toutes ses transactions supprimées avec succès");
        fetchActivities(); // Recharger la liste des activités

        // 🔥 ÉMETTRE LES ÉVÉNEMENTS POUR METTRE À JOUR L'HISTORIQUE DES TRANSACTIONS
        window.dispatchEvent(new CustomEvent("activityDeleted"));
        window.dispatchEvent(new CustomEvent("transactionUpdated"));
      } else {
        throw new Error(
          response.data.message || "Erreur lors de la suppression"
        );
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert(`❌ Erreur: ${error.message}`);
    }
  };

  // Filtrer les activités
  const filteredActivities = activities.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.name.toLowerCase().includes(searchLower) ||
      activity.description?.toLowerCase().includes(searchLower) ||
      activity.manager?.toLowerCase().includes(searchLower) ||
      activity.sector?.toLowerCase().includes(searchLower)
    );
  });

  // Calculer le nombre d'activités actives/archivées
  const activeActivities = activities.filter((a) => !a.isArchived).length;
  const archivedActivities = activities.filter((a) => a.isArchived).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-textSecondary">Chargement des activités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-inter font-bold text-textPrimary mb-2">
          <i className="fas fa-briefcase mr-3 text-primary"></i>
          Mes activités
        </h1>
        <p className="text-textSecondary text-sm md:text-base">
          Gérez l'ensemble de vos activités commerciales
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-xl p-4 shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-xs md:text-sm">
                Total des activités
              </p>
              <p className="text-xl md:text-2xl font-bold text-textPrimary">
                {activities.length}
              </p>
            </div>
            <i className="fas fa-layer-group text-2xl md:text-3xl text-primary"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-xs md:text-sm">
                Activités actives
              </p>
              <p className="text-xl md:text-2xl font-bold text-success">
                {activeActivities}
              </p>
            </div>
            <i className="fas fa-check-circle text-2xl md:text-3xl text-success"></i>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-textSecondary text-xs md:text-sm">
                Activités archivées
              </p>
              <p className="text-xl md:text-2xl font-bold text-textSecondary">
                {archivedActivities}
              </p>
            </div>
            <i className="fas fa-archive text-2xl md:text-3xl text-textSecondary"></i>
          </div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow border border-border mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          {/* Recherche */}
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary"></i>
              <input
                type="text"
                placeholder="Rechercher une activité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm md:text-base border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-2 md:space-x-3 mt-3 md:mt-0">
            <button
              onClick={fetchActivities}
              className="btn-outline flex items-center text-sm md:text-base px-3 md:px-4 py-2"
              title="Actualiser"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <Link
              to="/activities/new"
              className="btn-primary flex items-center text-sm md:text-base px-3 md:px-4 py-2"
            >
              <i className="fas fa-plus mr-2"></i>
              <span className="hidden sm:inline">Nouvelle activité</span>
              <span className="sm:hidden">Nouvelle</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <i className="fas fa-exclamation-circle text-red-500 mr-3 mt-1"></i>
            <div className="flex-1">
              <p className="text-red-700 font-medium text-sm md:text-base">
                Erreur
              </p>
              <p className="text-red-600 text-xs md:text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchActivities}
            className="mt-2 md:mt-3 text-xs md:text-sm text-blue-600 hover:underline flex items-center"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Réessayer
          </button>
        </div>
      )}

      {/* Liste des activités */}
      <div className="bg-white rounded-xl shadow border border-border overflow-hidden">
        {filteredActivities.length > 0 ? (
          <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
            <table className="w-full min-w-[800px] md:min-w-0">
              <thead className="bg-background">
                <tr>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Activité
                  </th>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Responsable
                  </th>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Secteur
                  </th>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Localisation
                  </th>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Statut
                  </th>
                  <th className="py-3 px-2 md:px-4 text-left text-xs md:text-sm font-medium text-textPrimary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity._id}
                    className="hover:bg-background transition-colors"
                  >
                    {/* Nom de l'activité */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div>
                        <Link
                          to={`/activities/${activity._id}`}
                          className="font-medium text-textPrimary hover:text-primary transition-colors text-sm md:text-base"
                        >
                          {activity.name}
                        </Link>
                        {activity.description && (
                          <p className="text-xs md:text-sm text-textSecondary mt-1 truncate max-w-[200px] md:max-w-xs">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 md:mr-3">
                          <i className="fas fa-user-tie text-primary text-xs md:text-sm"></i>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm md:text-base truncate">
                            {activity.manager}
                          </p>
                          {activity.contact?.email && (
                            <p className="text-xs text-textSecondary truncate">
                              {activity.contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Secteur */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-blue-50 text-blue-700">
                        <i className="fas fa-industry mr-1 md:mr-2"></i>
                        <span className="truncate max-w-[80px] md:max-w-none">
                          {activity.sector || "Non spécifié"}
                        </span>
                      </span>
                    </td>

                    {/* Localisation */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="flex items-center text-textSecondary text-sm">
                        <i className="fas fa-map-marker-alt mr-1 md:mr-2 text-xs md:text-sm"></i>
                        <span className="truncate max-w-[100px] md:max-w-none">
                          {activity.location?.city || "Ville inconnue"}
                          {activity.location?.country &&
                            `, ${activity.location.country}`}
                        </span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      {activity.isArchived ? (
                        <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-gray-100 text-gray-800">
                          <i className="fas fa-archive mr-1 md:mr-2"></i>
                          Archivée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 text-green-800">
                          <i className="fas fa-check-circle mr-1 md:mr-2"></i>
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 md:py-4 px-2 md:px-4">
                      <div className="flex space-x-1 md:space-x-2">
                        <Link
                          to={`/activities/${activity._id}`}
                          className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <i className="fas fa-eye text-xs md:text-sm"></i>
                        </Link>
                        <Link
                          to={`/activities/${activity._id}/edit`}
                          className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-textSecondary hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <i className="fas fa-edit text-xs md:text-sm"></i>
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteActivity(activity._id, activity.name)
                          }
                          className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash text-xs md:text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-background rounded-full mb-4">
              <i className="fas fa-briefcase text-2xl md:text-3xl text-textSecondary"></i>
            </div>
            <h3 className="text-base md:text-lg font-medium text-textPrimary mb-2">
              {searchTerm ? "Aucune activité trouvée" : "Aucune activité"}
            </h3>
            <p className="text-textSecondary text-sm mb-4 md:mb-6 max-w-md mx-auto px-4">
              {searchTerm
                ? "Essayez avec d'autres termes de recherche."
                : "Commencez par créer votre première activité pour organiser vos affaires."}
            </p>
            <Link
              to="/activities/new"
              className="btn-primary inline-flex items-center text-sm md:text-base px-4 py-2"
            >
              <i className="fas fa-plus mr-2"></i>
              Créer une activité
            </Link>
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-blue-600 mt-1 mr-2 md:mr-3"></i>
            <div>
              <h4 className="font-medium text-blue-900 text-sm md:text-base mb-1">
                Conseil
              </h4>
              <p className="text-xs md:text-sm text-blue-800">
                Pour une meilleure organisation, créez une activité distincte
                pour chaque secteur de votre entreprise.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4">
          <div className="flex items-start">
            <i className="fas fa-lightbulb text-green-600 mt-1 mr-2 md:mr-3"></i>
            <div>
              <h4 className="font-medium text-green-900 text-sm md:text-base mb-1">
                Astuce
              </h4>
              <p className="text-xs md:text-sm text-green-800">
                Attention : La suppression d'une activité supprime également
                toutes ses transactions. Pensez à exporter vos données si
                nécessaire.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-textSecondary text-xs md:text-sm">
        <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
        <p className="mt-1 text-xs">
          {activities.length} activité(s) • Dernière mise à jour:{" "}
          {new Date().toLocaleDateString()}
        </p>
      </footer>
    </div>
  );
};

export default Activities;
