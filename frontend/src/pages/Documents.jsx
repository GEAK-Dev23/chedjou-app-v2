import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityService } from "../services/activityService";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await activityService.getAllActivities();
      if (response.success) {
        setActivities(response.activities);

        // Charger les documents de toutes les activités
        const allDocuments = [];
        for (const activity of response.activities) {
          const docsResponse = await activityService.getActivityDocuments(
            activity._id
          );
          if (docsResponse.success && docsResponse.documents) {
            const activityDocs = docsResponse.documents.map((doc) => ({
              ...doc,
              activityName: activity.name,
              activityId: activity._id,
            }));
            allDocuments.push(...activityDocs);
          }
        }

        setDocuments(allDocuments);
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    // Filtre par type
    if (filter !== "all" && doc.type !== filter) return false;

    // Filtre par recherche
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getFileIcon = (fileName) => {
    if (fileName.includes(".pdf")) return "fa-file-pdf text-danger";
    if (fileName.match(/\.(jpg|jpeg|png|gif|svg)$/i))
      return "fa-file-image text-success";
    if (fileName.includes(".doc")) return "fa-file-word text-primary";
    if (fileName.includes(".xls")) return "fa-file-excel text-success";
    return "fa-file text-textSecondary";
  };

  const formatFileSize = (size) => {
    if (!size || typeof size === "string") return size || "Taille inconnue";

    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex justify-center items-center h-48 md:h-64">
          <i className="fas fa-spinner fa-spin text-3xl md:text-4xl text-primary"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-inter font-bold text-textPrimary mb-1 md:mb-2">
            <i className="fas fa-file-alt mr-2 md:mr-3 text-primary"></i>
            Documents justificatifs
          </h1>
          <p className="text-textSecondary text-sm md:text-base">
            Tous vos documents associés aux transactions et activités
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-file-alt text-primary text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Total Documents
              </h3>
              <p className="text-xl md:text-2xl font-bold text-textPrimary">
                {documents.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-file-invoice text-success text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Documents initiaux
              </h3>
              <p className="text-xl md:text-2xl font-bold text-success">
                {documents.filter((d) => d.type === "initial").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-danger/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-receipt text-danger text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Documents transactions
              </h3>
              <p className="text-xl md:text-2xl font-bold text-danger">
                {documents.filter((d) => d.type === "transaction").length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-background rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-briefcase text-textSecondary text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Activités
              </h3>
              <p className="text-xl md:text-2xl font-bold text-textPrimary">
                {activities.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card p-4 md:p-6 mb-4 md:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
              Type de document
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field text-sm md:text-base"
            >
              <option value="all">Tous les documents</option>
              <option value="initial">Documents initiaux</option>
              <option value="transaction">Documents de transaction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
              Activité
            </label>
            <select className="input-field text-sm md:text-base">
              <option value="all">Toutes les activités</option>
              {activities.map((activity) => (
                <option key={activity._id} value={activity._id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
              Rechercher par nom
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 md:pl-10 text-sm md:text-base"
                placeholder="Rechercher un document..."
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="card p-4 md:p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <i className="fas fa-file-alt text-3xl md:text-4xl text-textSecondary mb-3 md:mb-4"></i>
            <h3 className="text-lg md:text-xl font-inter font-semibold text-textPrimary mb-2">
              Aucun document
            </h3>
            <p className="text-textSecondary mb-4 md:mb-6 max-w-md mx-auto px-4 text-sm md:text-base">
              {documents.length === 0
                ? "Ajoutez des documents à vos activités et transactions pour les voir apparaître ici."
                : "Aucun document ne correspond à vos critères de recherche."}
            </p>
            {documents.length === 0 && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Link
                  to="/activities/new"
                  className="btn-primary inline-flex items-center justify-center text-sm md:text-base px-4 py-2"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Créer une activité
                </Link>
                <Link
                  to="/transactions/new"
                  className="btn-outline inline-flex items-center justify-center text-sm md:text-base px-4 py-2"
                >
                  <i className="fas fa-exchange-alt mr-2"></i>
                  Créer une transaction
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
              <table className="w-full min-w-[700px] md:min-w-0">
                <thead>
                  <tr>
                    <th className="table-header text-xs md:text-sm">
                      Nom du document
                    </th>
                    <th className="table-header text-xs md:text-sm">Type</th>
                    <th className="table-header text-xs md:text-sm">
                      Activité
                    </th>
                    <th className="table-header text-xs md:text-sm">Date</th>
                    <th className="table-header text-xs md:text-sm">Taille</th>
                    <th className="table-header text-xs md:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr
                      key={`${doc.type}-${doc.id}`}
                      className="hover:bg-background transition-colors"
                    >
                      <td className="table-cell">
                        <div className="flex items-center">
                          <i
                            className={`fas ${getFileIcon(
                              doc.name
                            )} mr-2 md:mr-3 text-base md:text-lg`}
                          ></i>
                          <div className="min-w-0">
                            <p className="font-medium text-textPrimary text-xs md:text-sm truncate max-w-[150px] md:max-w-xs">
                              {doc.name}
                            </p>
                            {doc.category && (
                              <p className="text-xs text-textSecondary">
                                Catégorie: {doc.category}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span
                          className={`badge-${
                            doc.type === "initial" ? "success" : "primary"
                          } text-xs md:text-sm`}
                        >
                          {doc.type === "initial" ? "Initial" : "Transaction"}
                        </span>
                      </td>
                      <td className="table-cell">
                        <Link
                          to={`/activities/${doc.activityId}`}
                          className="text-primary hover:underline text-xs md:text-sm truncate block max-w-[120px] md:max-w-none"
                        >
                          {doc.activityName}
                        </Link>
                      </td>
                      <td className="table-cell">
                        <span className="text-xs md:text-sm">
                          {new Date(doc.date).toLocaleDateString("fr-FR")}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="text-textSecondary text-xs md:text-sm">
                          {formatFileSize(doc.size)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-1 md:space-x-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                            title="Voir le document"
                          >
                            <i className="fas fa-eye text-sm md:text-base"></i>
                          </a>
                          <a
                            href={doc.url}
                            download
                            className="text-success hover:text-success/80"
                            title="Télécharger"
                          >
                            <i className="fas fa-download text-sm md:text-base"></i>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4">
              <div className="text-xs md:text-sm text-textSecondary">
                Affichage de {filteredDocuments.length} document(s) sur{" "}
                {documents.length}
              </div>
              <button
                onClick={loadActivities}
                className="text-primary hover:underline text-xs md:text-sm flex items-center"
              >
                <i className="fas fa-sync-alt mr-1 md:mr-2"></i>
                Actualiser la liste
              </button>
            </div>
          </>
        )}
      </div>

      {/* Informations */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
            <i className="fas fa-info-circle mr-2 text-primary"></i>
            Types de documents
          </h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-success rounded-full mr-2 md:mr-3"></div>
              <div>
                <p className="font-medium text-textPrimary text-sm md:text-base">
                  Documents initiaux
                </p>
                <p className="text-xs text-textSecondary">
                  Documents ajoutés lors de la création d'une activité
                  (contrats, licences, etc.)
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full mr-2 md:mr-3"></div>
              <div>
                <p className="font-medium text-textPrimary text-sm md:text-base">
                  Documents de transaction
                </p>
                <p className="text-xs text-textSecondary">
                  Justificatifs associés aux transactions (factures, reçus, bons
                  de commande)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
            <i className="fas fa-question-circle mr-2 text-primary"></i>
            Formats supportés
          </h3>
          <div className="flex flex-wrap gap-1 md:gap-2">
            {[
              "PDF",
              "JPG",
              "PNG",
              "DOC",
              "DOCX",
              "XLS",
              "XLSX",
              "TXT",
              "SVG",
            ].map((format) => (
              <span
                key={format}
                className="badge-primary text-xs px-2 py-1 md:px-3 md:py-1"
              >
                .{format.toLowerCase()}
              </span>
            ))}
          </div>
          <p className="text-xs text-textSecondary mt-2 md:mt-3">
            Taille maximale par fichier : 10 MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default Documents;
