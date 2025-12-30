import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { activityService } from "../services/activityService";
import api from "../services/api";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // AJOUT: Pour forcer le rechargement

  // Fonction pour gérer les mises à jour de transactions
  const handleTransactionUpdate = () => {
    console.log("🔄 Événement transactionUpdated reçu, rechargement...");
    loadTransactions();
  };

  useEffect(() => {
    loadTransactions();

    // AJOUT: Écouter les événements de suppression d'activité
    const handleActivityDeleted = () => {
      console.log("🔄 Activité supprimée, rechargement des transactions...");
      setRefreshTrigger((prev) => prev + 1);
    };

    window.addEventListener("activityDeleted", handleActivityDeleted);
    window.addEventListener("transactionUpdated", handleTransactionUpdate); // NOUVEAU

    return () => {
      window.removeEventListener("activityDeleted", handleActivityDeleted);
      window.removeEventListener("transactionUpdated", handleTransactionUpdate); // NOUVEAU
    };
  }, [filter, dateRange, refreshTrigger]); // AJOUT: refreshTrigger aux dépendances

  // AJOUT: Rafraîchissement automatique périodique PLUS RAPIDE
  useEffect(() => {
    const interval = setInterval(() => {
      loadTransactions();
    }, 300000); // Rafraîchit toutes les 5 secondes au lieu de 30

    return () => clearInterval(interval);
  }, []);

  // Modifiez loadTransactions :
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/transactions"); // AJOUTEZ /api/
      if (response.data.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Filtre par type
    if (filter !== "all" && transaction.type !== filter) return false;

    // Filtre par recherche
    if (
      search &&
      !transaction.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    // Filtre par date (simplifié)
    if (dateRange !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          return true;
      }

      if (transactionDate < startDate) return false;
    }

    return true;
  });

  const getTotal = (type) => {
    return filteredTransactions
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0);
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
            <i className="fas fa-exchange-alt mr-2 md:mr-3 text-primary"></i>
            Historique des transactions
          </h1>
          <p className="text-textSecondary text-sm md:text-base">
            Suivez toutes vos entrées et sorties d'argent
          </p>
        </div>
        <Link
          to="/transactions/new"
          className="btn-primary flex items-center text-sm md:text-base px-3 md:px-4 py-2 mt-2 sm:mt-0 self-start sm:self-auto"
        >
          <i className="fas fa-plus mr-1 md:mr-2"></i>
          <span className="hidden sm:inline">Nouvelle transaction</span>
          <span className="sm:hidden">Nouvelle</span>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <div className="card p-4 md:p-6">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-money-bill-wave text-success text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Total Gains
              </h3>
              <p className="text-xl md:text-2xl font-bold text-success">
                {getTotal("income").toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-danger/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-shopping-cart text-danger text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Total Dépenses
              </h3>
              <p className="text-xl md:text-2xl font-bold text-danger">
                {getTotal("expense").toLocaleString()} FCFA
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex items-center mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3 md:mr-4">
              <i className="fas fa-chart-line text-primary text-lg md:text-xl"></i>
            </div>
            <div>
              <h3 className="text-textSecondary text-xs md:text-sm">
                Solde Net
              </h3>
              <p
                className={`text-xl md:text-2xl font-bold ${
                  getTotal("income") - getTotal("expense") >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {(getTotal("income") - getTotal("expense")).toLocaleString()}{" "}
                FCFA
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
              Type de transaction
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field text-sm md:text-base"
            >
              <option value="all">Toutes les transactions</option>
              <option value="income">Gains uniquement</option>
              <option value="expense">Dépenses uniquement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
              Période
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field text-sm md:text-base"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
              Recherche
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 md:pl-10 text-sm md:text-base"
                placeholder="Rechercher une transaction..."
              />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des transactions */}
      <div className="card p-4 md:p-6">
        <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
          <table className="w-full min-w-[700px] md:min-w-0">
            <thead>
              <tr>
                <th className="table-header text-xs md:text-sm">Date</th>
                <th className="table-header text-xs md:text-sm">Description</th>
                <th className="table-header text-xs md:text-sm">Catégorie</th>
                <th className="table-header text-xs md:text-sm">Activité</th>
                <th className="table-header text-xs md:text-sm text-right">
                  Montant
                </th>
                <th className="table-header text-xs md:text-sm">Document</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="table-cell text-center py-6 md:py-8"
                  >
                    <i className="fas fa-exchange-alt text-3xl md:text-4xl text-textSecondary mb-3"></i>
                    <p className="text-textPrimary font-medium text-sm md:text-base">
                      Aucune transaction
                    </p>
                    <p className="text-textSecondary text-xs md:text-sm mt-1">
                      {transactions.length === 0
                        ? "Commencez par créer votre première transaction"
                        : "Aucune transaction ne correspond à vos filtres"}
                    </p>
                    {transactions.length === 0 && (
                      <Link
                        to="/transactions/new"
                        className="inline-flex items-center text-primary hover:underline mt-2 md:mt-3 text-xs md:text-sm"
                      >
                        <i className="fas fa-plus mr-1 md:mr-2"></i>
                        Créer une transaction
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="hover:bg-background transition-colors"
                  >
                    <td className="table-cell text-xs md:text-sm">
                      {new Date(transaction.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="table-cell">
                      <div className="max-w-[120px] md:max-w-xs truncate text-xs md:text-sm">
                        {transaction.description || "Sans description"}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge-primary text-xs md:text-sm">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-textSecondary text-xs md:text-sm truncate max-w-[100px] md:max-w-none">
                        {transaction.activityId?.name || "N/A"}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}{" "}
                        <span className="text-xs md:text-sm">
                          {transaction.amount.toLocaleString()} FCFA
                        </span>
                      </span>
                    </td>
                    <td className="table-cell">
                      {transaction.attachmentUrl ? (
                        <a
                          href={transaction.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="Voir le document"
                        >
                          <i className="fas fa-file text-sm md:text-base"></i>
                        </a>
                      ) : (
                        <span className="text-textSecondary text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/statistiques */}
        {filteredTransactions.length > 0 && (
          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4">
            <div className="text-xs md:text-sm text-textSecondary">
              Affichage de {filteredTransactions.length} transaction(s) sur{" "}
              {transactions.length}
            </div>
            <div className="text-xs md:text-sm">
              <span className="text-textSecondary">Total: </span>
              <span
                className={`font-bold ${
                  getTotal("income") - getTotal("expense") >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {getTotal("income") - getTotal("expense") >= 0 ? "+" : ""}
                {(
                  getTotal("income") - getTotal("expense")
                ).toLocaleString()}{" "}
                FCFA
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
