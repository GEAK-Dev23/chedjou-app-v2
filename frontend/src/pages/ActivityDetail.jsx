import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { activityAPI, transactionAPI } from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Formulaire édition activité
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    manager: "",
    managerEmail: "",
    managerPhone: "",
    city: "",
    country: "",
    sector: "",
    defaultCurrency: "FCFA",
  });

  // Formulaire nouvelle transaction
  const [transactionForm, setTransactionForm] = useState({
    type: "income",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    attachmentFile: null,
  });

  // Données pour la prévisualisation des fichiers
  const [editFile, setEditFile] = useState(null);
  const [transactionFile, setTransactionFile] = useState(null);

  // Charger les données
  useEffect(() => {
    loadActivityData();
  }, [id]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Charger l'activité
      const activityResponse = await activityAPI.getById(id);

      if (activityResponse.data.success) {
        const activityData = activityResponse.data.activity;
        setActivity(activityData);

        // Pré-remplir le formulaire d'édition
        setEditForm({
          name: activityData.name || "",
          description: activityData.description || "",
          manager: activityData.manager || "",
          managerEmail: activityData.contact?.email || "",
          managerPhone: activityData.contact?.phone || "",
          city: activityData.location?.city || "",
          country: activityData.location?.country || "",
          sector: activityData.sector || "",
          defaultCurrency: activityData.defaultCurrency || "FCFA",
        });

        // 2. Charger les transactions
        try {
          const transactionsResponse = await activityAPI.getTransactions(id);
          if (transactionsResponse.data.success) {
            const transactionsData =
              transactionsResponse.data.transactions || [];
            setTransactions(transactionsData);

            // Calculer les statistiques
            const income = transactionsData
              .filter((t) => t.type === "income")
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const expense = transactionsData
              .filter((t) => t.type === "expense")
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

            const initialIncome =
              activityData.initialAmountType === "income"
                ? Number(activityData.initialAmount) || 0
                : 0;
            const initialExpense =
              activityData.initialAmountType === "expense"
                ? Number(activityData.initialAmount) || 0
                : 0;

            const totalIncome = income + initialIncome;
            const totalExpense = expense + initialExpense;
            const currentBalance = totalIncome - totalExpense;

            setStats({
              totalIncome,
              totalExpense,
              currentBalance,
            });
          }
        } catch (transError) {
          console.error("Erreur chargement transactions:", transError);
          setTransactions([]);
        }

        // 3. Charger les documents
        try {
          const documentsResponse = await activityAPI.getDocuments(id);
          if (documentsResponse.data.success) {
            setDocuments(documentsResponse.data.documents || []);
          }
        } catch (docError) {
          console.error("Erreur chargement documents:", docError);
          setDocuments([]);
        }
      } else {
        throw new Error(
          activityResponse.data.message || "Erreur lors du chargement"
        );
      }
    } catch (error) {
      console.error("❌ Erreur chargement activité:", error);
      setError("Impossible de charger les données de l'activité");
      if (error.response?.status === 404) {
        navigate("/activities");
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer l'activité
  const handleDeleteActivity = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir archiver cette activité ?")) {
      return;
    }

    try {
      await activityAPI.delete(id);
      navigate("/activities");
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Mettre à jour l'activité
  const handleUpdateActivity = async () => {
    try {
      setUploading(true);
      setError(null);

      // Préparer les données
      const activityData = {
        name: editForm.name,
        description: editForm.description,
        manager: editForm.manager,
        sector: editForm.sector,
        defaultCurrency: editForm.defaultCurrency,
        location: {
          city: editForm.city,
          country: editForm.country,
        },
        contact: {
          email: editForm.managerEmail,
          phone: editForm.managerPhone,
        },
      };

      const response = await activityAPI.update(id, activityData, editFile);

      if (response.data.success) {
        setActivity(response.data.activity);
        setShowEditModal(false);
        setEditFile(null);
        setUploading(false);

        alert("✅ Activité mise à jour avec succès");
        loadActivityData(); // Recharger les données
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error);
      setError(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
      setUploading(false);
    }
  };

  // CORRECTION CRITIQUE ICI : Ajouter une transaction
  const handleAddTransaction = async () => {
    try {
      // Validation
      if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
        alert("Veuillez saisir un montant valide");
        return;
      }

      if (!transactionForm.category) {
        alert("Veuillez saisir une catégorie");
        return;
      }

      setUploading(true);
      setError(null);

      // Préparer les données de la transaction
      const transactionData = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        category: transactionForm.category,
        date: transactionForm.date,
        description: transactionForm.description || "",
      };

      console.log("📤 Ajout transaction avec données:", transactionData);
      console.log("📤 Activité ID:", id);

      // CORRECTION : Utiliser transactionAPI.create() au lieu de activityAPI.create()
      const response = await transactionAPI.create(
        id,
        transactionData,
        transactionFile
      );

      console.log("📥 Réponse API transaction:", response.data);

      if (response.data.success) {
        setShowTransactionModal(false);
        setTransactionForm({
          type: "income",
          amount: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
        setTransactionFile(null);
        setUploading(false);

        alert("✅ Transaction ajoutée avec succès");
        loadActivityData(); // Recharger les données
      } else {
        throw new Error(response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("❌ Erreur ajout transaction:", error);
      console.error("❌ Détails erreur:", error.response?.data);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de l'ajout de la transaction"
      );
      setUploading(false);
    }
  };

  // Gestion des fichiers
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 10MB)");
        return;
      }
      setEditFile(file);
    }
  };

  const handleTransactionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 10MB)");
        return;
      }
      setTransactionFile(file);
    }
  };

  // Télécharger un document
  const downloadDocument = (url, filename) => {
    if (!url) {
      alert("Aucun document disponible");
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "document";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Données pour les graphiques
  const getChartData = () => {
    const lastTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .reverse();

    return lastTransactions.map((trans, index) => ({
      name: `T${index + 1}`,
      montant: Number(trans.amount) || 0,
      type: trans.type === "income" ? "Gain" : "Dépense",
      date: trans.date ? new Date(trans.date).toLocaleDateString() : "N/A",
    }));
  };

  // Formater les montants
  const formatCurrency = (amount) => {
    return `${Number(amount || 0).toLocaleString()} FCFA`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-textSecondary">Chargement de l'activité...</p>
        </div>
      </div>
    );
  }

  if (error && !activity) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl p-6 md:p-8 shadow">
          <h1 className="text-xl md:text-3xl font-inter font-bold text-danger mb-4">
            <i className="fas fa-exclamation-triangle mr-3"></i>
            Erreur
          </h1>
          <p className="text-textSecondary mb-4 md:mb-6 text-sm md:text-base">
            {error}
          </p>
          <Link
            to="/activities"
            className="btn-primary inline-flex items-center text-sm md:text-base px-4 py-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Retour aux activités
          </Link>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-white rounded-xl p-6 md:p-8 shadow">
          <h1 className="text-xl md:text-3xl font-inter font-bold text-danger mb-4">
            <i className="fas fa-exclamation-triangle mr-3"></i>
            Activité non trouvée
          </h1>
          <p className="text-textSecondary mb-4 md:mb-6 text-sm md:text-base">
            L'activité que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link
            to="/activities"
            className="btn-primary inline-flex items-center text-sm md:text-base px-4 py-2"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Retour aux activités
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
        <div className="flex items-center">
          <Link
            to="/activities"
            className="text-primary hover:underline mr-3 md:mr-4 flex items-center text-sm md:text-base"
          >
            <i className="fas fa-arrow-left mr-1 md:mr-2"></i>
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl lg:text-3xl font-inter font-bold text-textPrimary truncate">
              <i className="fas fa-briefcase mr-2 md:mr-3 text-primary"></i>
              {activity.name}
            </h1>
            <p className="text-textSecondary text-xs md:text-sm truncate">
              Détails et gestion de l'activité
            </p>
          </div>
        </div>

        <div className="flex space-x-2 md:space-x-3 mt-3 md:mt-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-outline flex items-center text-sm md:text-base px-3 md:px-4 py-2"
            disabled={uploading}
          >
            <i className="fas fa-edit mr-1 md:mr-2"></i>
            <span className="hidden sm:inline">Modifier</span>
          </button>
          <button
            onClick={handleDeleteActivity}
            className="btn-danger flex items-center text-sm md:text-base px-3 md:px-4 py-2"
            disabled={uploading}
          >
            <i className="fas fa-trash mr-1 md:mr-2"></i>
            <span className="hidden sm:inline">Supprimer</span>
          </button>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-2 md:mr-3"></i>
            <p className="text-red-700 text-sm md:text-base">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs md:text-sm text-red-600 hover:underline"
          >
            <i className="fas fa-times mr-1"></i>
            Fermer
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Informations */}
          <div className="card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
              <i className="fas fa-info-circle mr-2 text-primary"></i>
              INFORMATIONS
            </h3>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start">
                <i className="fas fa-map-marker-alt text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div className="min-w-0">
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Localisation
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm truncate">
                    {activity.location?.city || "Non spécifié"},{" "}
                    {activity.location?.country || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <i className="fas fa-user-tie text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div className="min-w-0">
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Responsable
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm truncate">
                    {activity.manager}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <i className="fas fa-envelope text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div className="min-w-0">
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Email
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm truncate">
                    {activity.contact?.email || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <i className="fas fa-phone text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div className="min-w-0">
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Téléphone
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm">
                    {activity.contact?.phone || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <i className="fas fa-industry text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div className="min-w-0">
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Secteur
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm">
                    {activity.sector || "Non spécifié"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <i className="fas fa-money-bill-wave text-textSecondary mt-1 mr-2 md:mr-3 w-4 md:w-5"></i>
                <div>
                  <p className="font-medium text-textPrimary text-sm md:text-base">
                    Devise
                  </p>
                  <p className="text-textSecondary text-xs md:text-sm">
                    {activity.defaultCurrency || "FCFA"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Montant initial */}
          {activity.initialAmount > 0 && (
            <div className="card p-4 md:p-6">
              <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                <i className="fas fa-money-bill-wave mr-2 text-primary"></i>
                MONTANT INITIAL
              </h3>

              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary text-sm">Type:</span>
                  <span
                    className={`font-medium text-sm md:text-base ${
                      activity.initialAmountType === "income"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {activity.initialAmountType === "income"
                      ? "Gain"
                      : "Dépense"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-textSecondary text-sm">Montant:</span>
                  <span className="text-lg md:text-xl font-bold">
                    {formatCurrency(activity.initialAmount)}
                  </span>
                </div>
                {activity.initialDocumentUrl && (
                  <div className="pt-2 md:pt-3 border-t border-border">
                    <button
                      onClick={() =>
                        downloadDocument(
                          activity.initialDocumentUrl,
                          `document_initial_${activity.name}`
                        )
                      }
                      className="inline-flex items-center text-primary hover:underline text-xs md:text-sm"
                    >
                      <i className="fas fa-file-pdf mr-1 md:mr-2"></i>
                      <span className="truncate">Télécharger le document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Performance */}
          <div className="card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
              <i className="fas fa-chart-line mr-2 text-primary"></i>
              PERFORMANCE
            </h3>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-background p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-textSecondary text-xs md:text-sm">
                    Solde actuel
                  </span>
                  <span
                    className={`text-xs md:text-sm font-medium ${
                      stats.currentBalance >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {stats.currentBalance >= 0 ? "+" : ""}
                    {formatCurrency(stats.currentBalance)}
                  </span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-textPrimary">
                  {stats.currentBalance >= 0 ? "+" : ""}
                  {formatCurrency(stats.currentBalance)}
                </p>
              </div>

              <div className="bg-background p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-textSecondary text-xs md:text-sm">
                    Total Gains
                  </span>
                  <span className="text-xs md:text-sm font-medium text-success">
                    +{formatCurrency(stats.totalIncome)}
                  </span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-success">
                  +{formatCurrency(stats.totalIncome)}
                </p>
              </div>

              <div className="bg-background p-3 md:p-4 rounded-lg">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-textSecondary text-xs md:text-sm">
                    Total Dépenses
                  </span>
                  <span className="text-xs md:text-sm font-medium text-danger">
                    -{formatCurrency(stats.totalExpense)}
                  </span>
                </div>
                <p className="text-lg md:text-2xl font-bold text-danger">
                  -{formatCurrency(stats.totalExpense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Actions rapides */}
          <div className="card p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary">
                <i className="fas fa-bolt mr-2 text-primary"></i>
                ACTIONS RAPIDES
              </h3>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <button
                  onClick={() => setShowTransactionModal(true)}
                  className="btn-primary flex items-center text-sm md:text-base px-3 md:px-4 py-2"
                  disabled={uploading}
                >
                  <i className="fas fa-plus mr-1 md:mr-2"></i>
                  <span className="hidden sm:inline">Nouvelle Transaction</span>
                  <span className="sm:hidden">Transaction</span>
                </button>
                <Link
                  to={`/documents/${id}`}
                  className="btn-outline flex items-center text-sm md:text-base px-3 md:px-4 py-2"
                >
                  <i className="fas fa-folder-open mr-1 md:mr-2"></i>
                  <span className="hidden sm:inline">Voir Documents</span>
                  <span className="sm:hidden">Documents</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Évolution */}
          <div className="card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-4 md:mb-6 flex items-center">
              <i className="fas fa-chart-bar mr-2 text-primary"></i>
              ÉVOLUTION DES TRANSACTIONS
            </h3>

            <div className="h-48 md:h-64">
              {transactions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
                    <XAxis dataKey="name" stroke="#6C757D" fontSize={12} />
                    <YAxis
                      stroke="#6C757D"
                      fontSize={12}
                      tickFormatter={(value) => {
                        if (value === 0) return "0";
                        if (value < 1000) return value.toString();
                        if (value < 1000000)
                          return `${(value / 1000).toFixed(0)}K`;
                        return `${(value / 1000000).toFixed(1)}M`;
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        `${formatCurrency(value)}`,
                        "Montant",
                      ]}
                      labelFormatter={(label, items) => {
                        const item =
                          items && items[0] ? items[0].payload : null;
                        return item ? `${item.name} - ${item.date}` : label;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="montant"
                      name="Montant"
                      fill="#0F2557"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <i className="fas fa-chart-bar text-3xl md:text-4xl text-textSecondary mb-2 md:mb-4"></i>
                  <p className="text-textSecondary text-sm md:text-base">
                    Aucune donnée à afficher
                  </p>
                  <button
                    onClick={() => setShowTransactionModal(true)}
                    className="text-primary hover:underline mt-1 md:mt-2 text-xs md:text-sm"
                  >
                    Ajoutez votre première transaction
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid: Documents et Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* DOCUMENTS */}
            <div className="card p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary flex items-center">
                  <i className="fas fa-file-alt mr-2 text-primary"></i>
                  DOCUMENTS
                </h3>
                <span className="badge-primary text-xs md:text-sm">
                  {documents.length} document(s)
                </span>
              </div>

              <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto pr-1 md:pr-2">
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 md:p-3 hover:bg-background rounded-lg transition-colors"
                    >
                      <div className="flex items-center min-w-0">
                        {doc.url?.includes(".pdf") ? (
                          <i className="fas fa-file-pdf text-danger mr-2 md:mr-3 text-sm md:text-base"></i>
                        ) : doc.url?.match(
                            /\.(jpg|jpeg|png|gif|svg|webp)$/i
                          ) ? (
                          <i className="fas fa-file-image text-success mr-2 md:mr-3 text-sm md:text-base"></i>
                        ) : (
                          <i className="fas fa-file text-primary mr-2 md:mr-3 text-sm md:text-base"></i>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-textPrimary text-xs md:text-sm truncate">
                            {doc.name || "Document"}
                          </p>
                          <p className="text-xs text-textSecondary">
                            {doc.createdAt
                              ? new Date(doc.createdAt).toLocaleDateString()
                              : "Date inconnue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 ml-2">
                        <button
                          onClick={() => window.open(doc.url, "_blank")}
                          className="text-primary hover:text-primary/80 text-sm md:text-base"
                          title="Voir le document"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() =>
                            downloadDocument(doc.url, doc.name || "document")
                          }
                          className="text-primary hover:text-primary/80 text-sm md:text-base"
                          title="Télécharger"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 md:py-6">
                    <i className="fas fa-file-alt text-3xl md:text-4xl text-textSecondary mb-2"></i>
                    <p className="text-textSecondary text-sm md:text-base">
                      Aucun document
                    </p>
                    <p className="text-xs text-textSecondary mt-1">
                      Ajoutez un document lors de l'édition de l'activité
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* DERNIÈRES TRANSACTIONS */}
            <div className="card p-4 md:p-6">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary flex items-center">
                  <i className="fas fa-exchange-alt mr-2 text-primary"></i>
                  DERNIÈRES TRANSACTIONS
                </h3>
                <span className="badge-primary text-xs md:text-sm">
                  {transactions.length} transaction(s)
                </span>
              </div>

              <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
                <table className="w-full min-w-[500px] md:min-w-0">
                  <thead>
                    <tr>
                      <th className="table-header text-xs md:text-sm">Date</th>
                      <th className="table-header text-xs md:text-sm">
                        Description
                      </th>
                      <th className="table-header text-xs md:text-sm">
                        Catégorie
                      </th>
                      <th className="table-header text-xs md:text-sm text-right">
                        Montant
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((trans) => (
                      <tr
                        key={trans._id}
                        className="hover:bg-background transition-colors"
                      >
                        <td className="table-cell text-xs md:text-sm">
                          {trans.date
                            ? new Date(trans.date).toLocaleDateString()
                            : "Date inconnue"}
                        </td>
                        <td className="table-cell">
                          <div className="max-w-[100px] md:max-w-xs truncate text-xs md:text-sm">
                            {trans.description || "Sans description"}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="badge-primary text-xs md:text-sm">
                            {trans.category}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          <span
                            className={`font-medium text-xs md:text-sm ${
                              trans.type === "income"
                                ? "text-success"
                                : "text-danger"
                            }`}
                          >
                            {trans.type === "income" ? "+" : "-"}{" "}
                            {formatCurrency(trans.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {transactions.length === 0 && (
                  <div className="text-center py-4 md:py-6">
                    <i className="fas fa-exchange-alt text-3xl md:text-4xl text-textSecondary mb-2"></i>
                    <p className="text-textSecondary text-sm md:text-base">
                      Aucune transaction
                    </p>
                    <button
                      onClick={() => setShowTransactionModal(true)}
                      className="text-primary hover:underline mt-1 md:mt-2 text-xs md:text-sm"
                    >
                      Ajoutez votre première transaction
                    </button>
                  </div>
                )}

                {transactions.length > 5 && (
                  <Link
                    to={`/transactions?activity=${id}`}
                    className="w-full text-center text-primary hover:underline text-xs md:text-sm mt-3 md:mt-4 block"
                  >
                    <i className="fas fa-list mr-1 md:mr-2"></i>
                    Voir toutes les transactions
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Édition Activité */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
          <div className="bg-surface rounded-xl p-4 md:p-6 max-w-[95vw] md:max-w-2xl w-full max-h-[90vh] overflow-y-auto m-2">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-inter font-bold text-textPrimary">
                <i className="fas fa-edit mr-2 text-primary"></i>
                Modifier l'activité
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFile(null);
                }}
                className="text-textSecondary hover:text-textPrimary text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {error && (
              <div className="mb-3 md:mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Nom de l'activité *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="input-field text-sm md:text-base"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="input-field min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={editForm.manager}
                    onChange={(e) =>
                      setEditForm({ ...editForm, manager: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    value={editForm.managerPhone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, managerPhone: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) =>
                      setEditForm({ ...editForm, country: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Email du responsable
                  </label>
                  <input
                    type="email"
                    value={editForm.managerEmail}
                    onChange={(e) =>
                      setEditForm({ ...editForm, managerEmail: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    value={editForm.sector}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sector: e.target.value })
                    }
                    className="input-field text-sm md:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Document justificatif (facultatif)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-3 md:p-4 text-center hover:bg-background transition-colors">
                  <input
                    type="file"
                    id="editDocument"
                    onChange={handleEditFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.svg"
                  />
                  <label htmlFor="editDocument" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <i className="fas fa-cloud-upload-alt text-2xl md:text-3xl text-textSecondary mb-2"></i>
                      <p className="text-textSecondary text-sm mb-1">
                        Cliquez pour télécharger un document
                      </p>
                      <p className="text-xs text-textSecondary">
                        Formats acceptés: JPG, PNG, PDF, DOC, XLS (max 10MB)
                      </p>
                      {editFile && (
                        <div className="mt-3 bg-background p-3 rounded-lg border border-border w-full">
                          <div className="flex items-center">
                            <i className="fas fa-file text-primary mr-2 md:mr-3"></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-textPrimary truncate">
                                {editFile.name}
                              </p>
                              <p className="text-xs text-textSecondary">
                                {(editFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditFile(null);
                              }}
                              className="text-danger hover:text-danger/80 ml-2"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditFile(null);
                }}
                className="btn-outline text-sm md:text-base px-4 py-2 mt-2 sm:mt-0"
                disabled={uploading}
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateActivity}
                className="btn-primary text-sm md:text-base px-4 py-2"
                disabled={uploading || !editForm.name || !editForm.manager}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouvelle Transaction */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-surface rounded-xl p-4 md:p-6 max-w-[95vw] md:max-w-md w-full max-h-[90vh] overflow-y-auto m-2">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-inter font-bold text-textPrimary">
                <i className="fas fa-plus-circle mr-2 text-primary"></i>
                Nouvelle Transaction
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-textSecondary hover:text-textPrimary text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Type *
                </label>
                <div className="flex flex-wrap gap-3 md:gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={transactionForm.type === "income"}
                      onChange={() =>
                        setTransactionForm({
                          ...transactionForm,
                          type: "income",
                        })
                      }
                      className="mr-2"
                    />
                    <span className="font-medium text-success text-sm md:text-base">
                      Gain
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={transactionForm.type === "expense"}
                      onChange={() =>
                        setTransactionForm({
                          ...transactionForm,
                          type: "expense",
                        })
                      }
                      className="mr-2"
                    />
                    <span className="font-medium text-danger text-sm md:text-base">
                      Dépense
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Montant ({activity.defaultCurrency || "FCFA"}) *
                </label>
                <input
                  type="number"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      amount: e.target.value,
                    })
                  }
                  className="input-field text-sm md:text-base"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Catégorie *
                </label>
                <input
                  type="text"
                  value={transactionForm.category}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      category: e.target.value,
                    })
                  }
                  className="input-field text-sm md:text-base"
                  placeholder="Ex: Vente, Achat, Salaire..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={transactionForm.date}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      date: e.target.value,
                    })
                  }
                  className="input-field text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Description
                </label>
                <textarea
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      description: e.target.value,
                    })
                  }
                  className="input-field resize-none text-sm md:text-base"
                  placeholder="Description de la transaction..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                  Document justificatif (facultatif)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-3 md:p-4 text-center hover:bg-background transition-colors">
                  <input
                    type="file"
                    id="transactionDocument"
                    onChange={handleTransactionFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.svg"
                  />
                  <label
                    htmlFor="transactionDocument"
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <i className="fas fa-cloud-upload-alt text-xl md:text-2xl text-textSecondary mb-2"></i>
                      <p className="text-sm text-textSecondary mb-1">
                        Cliquez pour ajouter un document
                      </p>
                      <p className="text-xs text-textSecondary">
                        Formats acceptés: JPG, PNG, PDF, DOC, XLS (max 10MB)
                      </p>
                      {transactionFile && (
                        <div className="mt-3 bg-background p-3 rounded-lg border border-border w-full">
                          <div className="flex items-center">
                            <i className="fas fa-file text-primary mr-2 md:mr-3"></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-textPrimary truncate">
                                {transactionFile.name}
                              </p>
                              <p className="text-xs text-textSecondary">
                                {(transactionFile.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTransactionFile(null);
                              }}
                              className="text-danger hover:text-danger/80 ml-2"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2 md:gap-4">
              <button
                onClick={() => setShowTransactionModal(false)}
                className="btn-outline text-sm md:text-base px-4 py-2 mt-2 sm:mt-0"
                disabled={uploading}
              >
                Annuler
              </button>
              <button
                onClick={handleAddTransaction}
                className="btn-primary text-sm md:text-base px-4 py-2"
                disabled={
                  uploading ||
                  !transactionForm.amount ||
                  parseFloat(transactionForm.amount) <= 0 ||
                  !transactionForm.category
                }
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-textSecondary text-xs md:text-sm">
        <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default ActivityDetail;
