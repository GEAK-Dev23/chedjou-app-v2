import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { activityAPI } from "../services/api";

const Dashboard = () => {
  // États pour les données réelles
  const [activities, setActivities] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    totalGains: 0,
    totalExpenses: 0,
    totalProfit: 0,
    gainsEvolutionData: [],
    expensesDistributionData: [],
    gainsExpensesEvolutionData: [],
    activitiesList: [],
  });

  // Charger les données au montage du composant
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fonction pour charger toutes les données
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Charger les activités
      const activitiesResponse = await activityAPI.getAll();
      if (!activitiesResponse.data.success) {
        throw new Error(
          activitiesResponse.data.message || "Erreur chargement activités"
        );
      }

      const activitiesData = activitiesResponse.data.activities || [];
      setActivities(activitiesData);

      if (activitiesData.length === 0) {
        setDashboardData({
          totalGains: 0,
          totalExpenses: 0,
          totalProfit: 0,
          gainsEvolutionData: [],
          expensesDistributionData: [],
          gainsExpensesEvolutionData: [],
          activitiesList: [],
        });
        setTransactions([]);
        setLoading(false);
        return;
      }

      // 2. Charger toutes les transactions
      const allTransactions = [];
      for (const activity of activitiesData) {
        try {
          const transactionsResponse = await activityAPI.getTransactions(
            activity._id
          );
          if (
            transactionsResponse.data.success &&
            transactionsResponse.data.transactions
          ) {
            // Ajouter l'ID de l'activité à chaque transaction pour faciliter le filtrage
            const transactionsWithActivityId =
              transactionsResponse.data.transactions.map((trans) => ({
                ...trans,
                activityName: activity.name,
                activityId: activity._id,
              }));
            allTransactions.push(...transactionsWithActivityId);
          }
        } catch (error) {
          console.warn(
            `⚠️ Erreur chargement transactions activité ${activity.name}:`,
            error.message
          );
        }
      }

      setTransactions(allTransactions);

      // 3. Calculer les données du dashboard
      calculateDashboardData(activitiesData, allTransactions);
    } catch (error) {
      console.error("❌ Erreur chargement dashboard:", error);
      setError(error.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer les données du dashboard
  const calculateDashboardData = (activitiesList, transactionsList) => {
    console.log("📊 Calcul des données du dashboard...");
    console.log("Activités:", activitiesList.length);
    console.log("Transactions:", transactionsList.length);

    if (!activitiesList || activitiesList.length === 0) {
      setDashboardData({
        totalGains: 0,
        totalExpenses: 0,
        totalProfit: 0,
        gainsEvolutionData: [],
        expensesDistributionData: [],
        gainsExpensesEvolutionData: [],
        activitiesList: [],
      });
      return;
    }

    // 1. Calculer les totaux globaux et les statistiques par activité
    let totalGains = 0;
    let totalExpenses = 0;

    const activitiesWithStats = activitiesList.map((activity) => {
      console.log(`📈 Calcul pour activité: ${activity.name}`);

      // Récupérer les transactions de cette activité
      const activityTransactions = transactionsList.filter(
        (t) => t.activityId === activity._id
      );
      console.log(`   Transactions: ${activityTransactions.length}`);

      // Calculer les gains (income)
      const activityIncome = activityTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Ajouter le montant initial si c'est un gain
      const initialIncome =
        activity.initialAmountType === "income"
          ? Number(activity.initialAmount) || 0
          : 0;

      // Calculer les dépenses (expense)
      const activityExpense = activityTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      // Ajouter le montant initial si c'est une dépense
      const initialExpense =
        activity.initialAmountType === "expense"
          ? Number(activity.initialAmount) || 0
          : 0;

      const gains = activityIncome + initialIncome;
      const expenses = activityExpense + initialExpense;
      const profit = gains - expenses;

      console.log(
        `   Gains: ${gains}, Dépenses: ${expenses}, Profit: ${profit}`
      );

      totalGains += gains;
      totalExpenses += expenses;

      return {
        id: activity._id,
        name: activity.name,
        gains: gains,
        expenses: expenses,
        profit: profit,
        color: getActivityColor(activity._id),
      };
    });

    const totalProfit = totalGains - totalExpenses;

    console.log("📈 Totaux globaux:");
    console.log(`   Total Gains: ${totalGains}`);
    console.log(`   Total Expenses: ${totalExpenses}`);
    console.log(`   Total Profit: ${totalProfit}`);

    // 2. Données pour l'évolution des gains (6 derniers mois)
    const gainsEvolutionData = generateMonthlyData(
      activitiesList,
      transactionsList,
      "income"
    );
    console.log("📈 Données évolution gains:", gainsEvolutionData);

    // 3. Données pour la répartition des dépenses
    const expensesDistributionData = activitiesWithStats
      .map((activity, index) => {
        const percentage =
          totalExpenses > 0 ? (activity.expenses / totalExpenses) * 100 : 0;

        return {
          name: activity.name,
          value: parseFloat(percentage.toFixed(2)),
          amount: activity.expenses,
          color: activity.color,
        };
      })
      .filter((item) => item.value > 0);

    console.log("📈 Données répartition dépenses:", expensesDistributionData);

    // 4. Données pour l'évolution gains/dépenses
    const gainsExpensesEvolutionData = generateMonthlyComparisonData(
      activitiesList,
      transactionsList
    );
    console.log(
      "📈 Données évolution gains/dépenses:",
      gainsExpensesEvolutionData
    );

    setDashboardData({
      totalGains,
      totalExpenses,
      totalProfit,
      gainsEvolutionData,
      expensesDistributionData,
      gainsExpensesEvolutionData,
      activitiesList: activitiesWithStats,
    });

    console.log("✅ Calcul des données terminé");
  };

  // Fonction pour générer une couleur unique par activité
  const getActivityColor = (activityId) => {
    const colors = [
      "#0F2557", // Bleu foncé
      "#28A745", // Vert
      "#FFC107", // Jaune
      "#DC3545", // Rouge
      "#6F42C1", // Violet
      "#20C997", // Turquoise
      "#FD7E14", // Orange
      "#E83E8C", // Rose
      "#17A2B8", // Cyan
      "#6C757D", // Gris
    ];

    // Générer un index basé sur l'ID de l'activité
    const hash = activityId
      ? activityId
          .toString()
          .split("")
          .reduce((acc, char) => {
            return acc + char.charCodeAt(0);
          }, 0)
      : 0;

    return colors[hash % colors.length];
  };

  // Fonction pour générer les données mensuelles
  const generateMonthlyData = (activitiesList, transactionsList, type) => {
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const result = [];
    const currentDate = new Date();

    // Générer les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      const year = date.getFullYear();

      let total = 0;

      // Pour chaque activité
      activitiesList.forEach((activity) => {
        const activityTransactions = transactionsList.filter((t) => {
          if (!t.date) return false;

          const transactionDate = new Date(t.date);
          const transMonth = transactionDate.getMonth();
          const transYear = transactionDate.getFullYear();

          return (
            transMonth === monthIndex &&
            transYear === year &&
            t.activityId === activity._id &&
            t.type === type
          );
        });

        total += activityTransactions.reduce(
          (sum, t) => sum + (Number(t.amount) || 0),
          0
        );
      });

      // Ajouter aussi les montants initiaux des activités
      if (type === "income") {
        activitiesList.forEach((activity) => {
          if (activity.initialAmountType === type) {
            // Vérifier si le montant initial est dans ce mois
            const activityDate = activity.createdAt
              ? new Date(activity.createdAt)
              : new Date();
            if (
              activityDate.getMonth() === monthIndex &&
              activityDate.getFullYear() === year
            ) {
              total += Number(activity.initialAmount) || 0;
            }
          }
        });
      }

      result.push({
        month: monthName,
        [type === "income" ? "gains" : "dépenses"]: total,
        fullMonth: `${monthName} ${year}`,
      });
    }

    return result;
  };

  // Fonction pour générer les données de comparaison mensuelle
  const generateMonthlyComparisonData = (activitiesList, transactionsList) => {
    const months = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];
    const result = [];
    const currentDate = new Date();

    // Générer les 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      const year = date.getFullYear();

      let totalGains = 0;
      let totalExpenses = 0;

      // Pour chaque activité
      activitiesList.forEach((activity) => {
        const activityTransactions = transactionsList.filter((t) => {
          if (!t.date) return false;

          const transactionDate = new Date(t.date);
          const transMonth = transactionDate.getMonth();
          const transYear = transactionDate.getFullYear();

          return (
            transMonth === monthIndex &&
            transYear === year &&
            t.activityId === activity._id
          );
        });

        activityTransactions.forEach((t) => {
          if (t.type === "income") {
            totalGains += Number(t.amount) || 0;
          } else if (t.type === "expense") {
            totalExpenses += Number(t.amount) || 0;
          }
        });

        // Ajouter les montants initiaux
        const activityDate = activity.createdAt
          ? new Date(activity.createdAt)
          : new Date();
        if (
          activityDate.getMonth() === monthIndex &&
          activityDate.getFullYear() === year
        ) {
          if (activity.initialAmountType === "income") {
            totalGains += Number(activity.initialAmount) || 0;
          } else if (activity.initialAmountType === "expense") {
            totalExpenses += Number(activity.initialAmount) || 0;
          }
        }
      });

      result.push({
        period: i + 1,
        month: monthName,
        year: year,
        gains: totalGains,
        expenses: totalExpenses,
        fullMonth: `${monthName} ${year}`,
      });
    }

    return result;
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    console.log("🔄 Rafraîchissement des données...");
    fetchDashboardData();
  };

  // Fonction pour supprimer une activité
  const handleDeleteActivity = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")
    ) {
      return;
    }

    try {
      const response = await activityAPI.delete(id);
      if (response.data.success) {
        alert("✅ Activité supprimée avec succès");
        fetchDashboardData(); // Rafraîchir les données
      } else {
        alert("❌ Erreur lors de la suppression: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Format des nombres pour les tooltips
  const formatCurrency = (value) => {
    return `${Number(value).toLocaleString()} FCFA`;
  };

  // Formatter les pourcentages
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-textSecondary">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 lg:p-8">
      {/* En-tête avec bouton rafraîchir */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-inter font-bold text-textPrimary mb-1 md:mb-2">
            <i className="fas fa-tachometer-alt mr-2 md:mr-3 text-primary"></i>
            Tableau de bord
          </h1>
          <p className="text-textSecondary text-sm md:text-base">
            Vue d'ensemble de vos activités
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-primary flex items-center text-sm md:text-base px-3 md:px-4 py-2 self-start sm:self-auto"
        >
          <i className="fas fa-sync-alt mr-1 md:mr-2"></i>
          <span className="hidden sm:inline">Rafraîchir</span>
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-2 md:mr-3"></i>
            <p className="text-red-700 text-sm md:text-base">{error}</p>
          </div>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-4 md:mb-6 lg:mb-8">
        {/* Carte Gains */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-textPrimary">
              <i className="fas fa-money-bill-wave mr-2 text-success"></i>
              Gains totaux
            </h3>
            <span className="text-success font-semibold text-sm md:text-base">
              <i className="fas fa-arrow-up mr-1"></i>
              {dashboardData.totalGains > 0 ? "+" : ""}
              {formatCurrency(dashboardData.totalGains)}
            </span>
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-success">
            {formatCurrency(dashboardData.totalGains)}
          </p>
          <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2">
            {activities.length} activité(s)
          </p>
        </div>

        {/* Carte Dépenses */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-textPrimary">
              <i className="fas fa-shopping-cart mr-2 text-danger"></i>
              Dépenses totales
            </h3>
            <span className="text-danger font-semibold text-sm md:text-base">
              <i className="fas fa-arrow-down mr-1"></i>-
              {formatCurrency(dashboardData.totalExpenses)}
            </span>
          </div>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-danger">
            {formatCurrency(dashboardData.totalExpenses)}
          </p>
          <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2">
            Total des sorties
          </p>
        </div>

        {/* Carte Bénéfice */}
        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-base md:text-lg font-semibold text-textPrimary">
              <i className="fas fa-chart-line mr-2 text-primary"></i>
              Bénéfice net
            </h3>
            <span
              className={
                dashboardData.totalProfit >= 0
                  ? "text-success font-semibold text-sm md:text-base"
                  : "text-danger font-semibold text-sm md:text-base"
              }
            >
              <i
                className={
                  dashboardData.totalProfit >= 0
                    ? "fas fa-arrow-up mr-1"
                    : "fas fa-arrow-down mr-1"
                }
              ></i>
              {dashboardData.totalProfit >= 0 ? "+" : ""}
              {formatCurrency(dashboardData.totalProfit)}
            </span>
          </div>
          <p
            className={`text-xl md:text-2xl lg:text-3xl font-bold ${
              dashboardData.totalProfit >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {dashboardData.totalProfit >= 0 ? "+" : ""}
            {formatCurrency(Math.abs(dashboardData.totalProfit))}
          </p>
          <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2">
            Solde global
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
        {/* Graphique Évolution des gains */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-4 md:mb-6">
            <i className="fas fa-chart-bar mr-2 text-primary"></i>
            Évolution des gains (6 mois)
          </h3>

          <div className="h-48 md:h-56 lg:h-64">
            {dashboardData.gainsEvolutionData.length > 0 &&
            dashboardData.gainsEvolutionData.some((item) => item.gains > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardData.gainsEvolutionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#DEE2E6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#6C757D"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#6C757D"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tickFormatter={(value) => {
                      if (value === 0) return "0";
                      // Format simplifié pour les petites valeurs
                      if (value < 1000) return value.toString();
                      // Format en K pour les milliers
                      if (value < 1000000)
                        return `${(value / 1000).toFixed(0)}K`;
                      // Format en M pour les millions
                      return `${(value / 1000000).toFixed(1)}M`;
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Gains"]}
                    labelFormatter={(label) => `Mois: ${label}`}
                  />
                  <Bar
                    dataKey="gains"
                    fill="#28A745"
                    radius={[4, 4, 0, 0]}
                    name="Gains"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <i className="fas fa-chart-bar text-3xl md:text-4xl text-textSecondary mb-3 md:mb-4"></i>
                <p className="text-textSecondary text-sm md:text-base text-center">
                  Aucune donnée à afficher
                </p>
                <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2 text-center">
                  Ajoutez des transactions de type "Gain" pour voir les données
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Graphique Répartition des dépenses */}
        <div className="card p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-4 md:mb-6">
            <i className="fas fa-chart-pie mr-2 text-primary"></i>
            Répartition des dépenses par activité
          </h3>

          <div className="h-48 md:h-56 lg:h-64">
            {dashboardData.expensesDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.expensesDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={true}
                  >
                    {dashboardData.expensesDistributionData.map(
                      (entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${formatCurrency(
                        props.payload.amount
                      )} (${formatPercentage(value)})`,
                      props.payload.name,
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry) => (
                      <span style={{ color: "#333", fontSize: "10px" }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <i className="fas fa-chart-pie text-3xl md:text-4xl text-textSecondary mb-3 md:mb-4"></i>
                <p className="text-textSecondary text-sm md:text-base text-center">
                  Aucune dépense enregistrée
                </p>
                <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2 text-center">
                  Ajoutez des transactions de type "Dépense" pour voir les
                  données
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphique Évolution gains/dépenses */}
      <div className="card p-4 md:p-6 mb-4 md:mb-6 lg:mb-8">
        <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-4 md:mb-6">
          <i className="fas fa-chart-line mr-2 text-primary"></i>
          Évolution des gains et des dépenses (12 mois)
        </h3>

        <div className="h-48 md:h-64 lg:h-80">
          {dashboardData.gainsExpensesEvolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.gainsExpensesEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" />
                <XAxis
                  dataKey="month"
                  stroke="#6C757D"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickFormatter={(value, index) => {
                    const dataPoint =
                      dashboardData.gainsExpensesEvolutionData[index];
                    return dataPoint && dataPoint.year
                      ? `${value} ${dataPoint.year.toString().slice(-2)}`
                      : value;
                  }}
                />
                <YAxis
                  stroke="#6C757D"
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    // Format simplifié
                    if (value < 1000) return value.toString();
                    if (value < 1000000) return `${(value / 1000).toFixed(0)}K`;
                    return `${(value / 1000000).toFixed(1)}M`;
                  }}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), "Montant"]}
                  labelFormatter={(label, items) => {
                    const item = items && items[0] ? items[0].payload : null;
                    return item ? item.fullMonth || label : label;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="gains"
                  stroke="#28A745"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Gains"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#DC3545"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Dépenses"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <i className="fas fa-chart-line text-3xl md:text-4xl text-textSecondary mb-3 md:mb-4"></i>
              <p className="text-textSecondary text-sm md:text-base text-center">
                Aucune donnée d'évolution disponible
              </p>
              <p className="text-xs md:text-sm text-textSecondary mt-1 md:mt-2 text-center">
                Ajoutez des activités et des transactions pour voir les données
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Liste des activités */}
      <div className="card p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-textPrimary">
            <i className="fas fa-briefcase mr-2 text-primary"></i>
            Vos activités ({dashboardData.activitiesList.length})
          </h3>
          <div className="flex space-x-2 md:space-x-3">
            <button
              onClick={handleRefresh}
              className="btn-secondary flex items-center text-sm md:text-base px-3 md:px-4 py-2"
            >
              <i className="fas fa-sync-alt mr-1 md:mr-2"></i>
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <Link
              to="/activities/new"
              className="btn-primary flex items-center text-sm md:text-base px-3 md:px-4 py-2"
            >
              <i className="fas fa-plus mr-1 md:mr-2"></i>
              <span className="hidden sm:inline">Nouvelle activité</span>
              <span className="sm:hidden">Nouvelle</span>
            </Link>
          </div>
        </div>

        {dashboardData.activitiesList.length > 0 ? (
          <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
            <table className="w-full min-w-[600px] md:min-w-0">
              <thead>
                <tr>
                  <th className="table-header text-xs md:text-sm">Nom</th>
                  <th className="table-header text-xs md:text-sm">Gains</th>
                  <th className="table-header text-xs md:text-sm">Dépenses</th>
                  <th className="table-header text-xs md:text-sm">Bénéfice</th>
                  <th className="table-header text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.activitiesList.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-background transition-colors"
                  >
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-2 md:mr-3"
                          style={{ backgroundColor: activity.color }}
                        ></div>
                        <span className="font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                          {activity.name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-success font-semibold text-sm md:text-base">
                        + {formatCurrency(activity.gains)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-danger font-semibold text-sm md:text-base">
                        - {formatCurrency(activity.expenses)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span
                        className={`font-semibold text-sm md:text-base ${
                          activity.profit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {activity.profit >= 0 ? "+" : ""}
                        {formatCurrency(Math.abs(activity.profit))}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-1 md:space-x-2">
                        <Link
                          to={`/activities/${activity.id}`}
                          className="text-primary hover:text-primary/80"
                          title="Voir détails"
                        >
                          <i className="fas fa-eye text-sm md:text-base"></i>
                        </Link>
                        <Link
                          to={`/activities/${activity.id}/edit`}
                          className="text-textSecondary hover:text-textPrimary"
                          title="Modifier"
                        >
                          <i className="fas fa-edit text-sm md:text-base"></i>
                        </Link>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="text-danger hover:text-danger/80"
                          title="Supprimer"
                        >
                          <i className="fas fa-trash text-sm md:text-base"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 md:py-8">
            <i className="fas fa-briefcase text-3xl md:text-4xl text-textSecondary mb-3 md:mb-4"></i>
            <p className="text-textSecondary text-sm md:text-base mb-3 md:mb-4">
              Aucune activité créée
            </p>
            <Link
              to="/activities/new"
              className="btn-primary inline-flex items-center text-sm md:text-base px-4 py-2"
            >
              <i className="fas fa-plus mr-2"></i>
              Créer votre première activité
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-textSecondary text-xs md:text-sm">
        <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
        <p className="mt-1 text-xs">
          {dashboardData.activitiesList.length} activité(s) •{" "}
          {transactions.length} transaction(s)
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
