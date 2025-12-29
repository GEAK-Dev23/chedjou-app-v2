// Utilitaires pour les calculs financiers

// Formater un montant
export const formatCurrency = (amount, currency = "FCFA") => {
  if (amount === null || amount === undefined) return `0 ${currency}`;
  return `${Number(amount).toLocaleString("fr-FR")} ${currency}`;
};

// Formater un pourcentage
export const formatPercentage = (value) => {
  return `${Number(value).toFixed(2)}%`;
};

// Calculer le total par type
export const calculateTotalByType = (transactions, type) => {
  if (!transactions || !Array.isArray(transactions)) return 0;
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
};

// Calculer le solde d'une activité
export const calculateActivityBalance = (activity, transactions = []) => {
  if (!activity) return 0;

  const activityTransactions = transactions.filter(
    (t) => t.activityId === activity._id
  );

  const totalIncome = calculateTotalByType(activityTransactions, "income");
  const totalExpense = calculateTotalByType(activityTransactions, "expense");

  const initialIncome =
    activity.initialAmountType === "income"
      ? Number(activity.initialAmount) || 0
      : 0;
  const initialExpense =
    activity.initialAmountType === "expense"
      ? Number(activity.initialAmount) || 0
      : 0;

  return totalIncome + initialIncome - (totalExpense + initialExpense);
};

// Calculer les totaux globaux
export const calculateGlobalTotals = (activities, transactions) => {
  let totalGains = 0;
  let totalExpenses = 0;

  activities.forEach((activity) => {
    const activityTransactions = transactions.filter(
      (t) => t.activityId === activity._id
    );

    const activityIncome = calculateTotalByType(activityTransactions, "income");
    const activityExpense = calculateTotalByType(
      activityTransactions,
      "expense"
    );

    const initialIncome =
      activity.initialAmountType === "income"
        ? Number(activity.initialAmount) || 0
        : 0;
    const initialExpense =
      activity.initialAmountType === "expense"
        ? Number(activity.initialAmount) || 0
        : 0;

    totalGains += activityIncome + initialIncome;
    totalExpenses += activityExpense + initialExpense;
  });

  const totalProfit = totalGains - totalExpenses;

  return {
    totalGains,
    totalExpenses,
    totalProfit,
  };
};

// Générer des données mensuelles pour les graphiques
export const generateMonthlyChartData = (
  activities,
  transactions,
  monthsCount = 6,
  type = null
) => {
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

  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const monthIndex = date.getMonth();
    const monthName = months[monthIndex];
    const year = date.getFullYear();

    let total = 0;

    // Si un type spécifique est demandé
    if (type) {
      activities.forEach((activity) => {
        const activityTransactions = transactions.filter((t) => {
          if (!t.date || t.type !== type) return false;

          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === monthIndex &&
            transactionDate.getFullYear() === year &&
            t.activityId === activity._id
          );
        });

        total += activityTransactions.reduce(
          (sum, t) => sum + (Number(t.amount) || 0),
          0
        );
      });

      // Ajouter les montants initiaux
      activities.forEach((activity) => {
        if (activity.initialAmountType === type) {
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

      result.push({
        month: monthName,
        [type === "income" ? "gains" : "dépenses"]: total,
        fullMonth: `${monthName} ${year}`,
        year: year,
      });
    } else {
      // Pour les données comparatives (gains vs dépenses)
      let totalGains = 0;
      let totalExpenses = 0;

      activities.forEach((activity) => {
        const activityTransactions = transactions.filter((t) => {
          if (!t.date) return false;

          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === monthIndex &&
            transactionDate.getFullYear() === year &&
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
        month: monthName,
        gains: totalGains,
        expenses: totalExpenses,
        fullMonth: `${monthName} ${year}`,
        year: year,
      });
    }
  }

  return result;
};

// Générer des données pour le diagramme circulaire
export const generatePieChartData = (activities, transactions) => {
  const totals = calculateGlobalTotals(activities, transactions);

  return activities
    .map((activity) => {
      const activityTransactions = transactions.filter(
        (t) => t.activityId === activity._id
      );
      const activityExpense = calculateTotalByType(
        activityTransactions,
        "expense"
      );
      const initialExpense =
        activity.initialAmountType === "expense"
          ? Number(activity.initialAmount) || 0
          : 0;
      const totalActivityExpense = activityExpense + initialExpense;

      const percentage =
        totals.totalExpenses > 0
          ? (totalActivityExpense / totals.totalExpenses) * 100
          : 0;

      return {
        name: activity.name,
        value: parseFloat(percentage.toFixed(2)),
        amount: totalActivityExpense,
        activityId: activity._id,
      };
    })
    .filter((item) => item.value > 0);
};

// Obtenir une couleur pour une activité
export const getActivityColor = (activityId, index = 0) => {
  const colors = [
    "#0F2557",
    "#28A745",
    "#FFC107",
    "#DC3545",
    "#6F42C1",
    "#20C997",
    "#FD7E14",
    "#E83E8C",
    "#17A2B8",
    "#6C757D",
  ];

  if (activityId) {
    const hash = activityId
      .toString()
      .split("")
      .reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
    return colors[hash % colors.length];
  }

  return colors[index % colors.length];
};
