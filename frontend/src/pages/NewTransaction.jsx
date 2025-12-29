import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { activityService } from "../services/activityService";
import api from "../services/api";

const NewTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const [formData, setFormData] = useState({
    activityId: "",
    type: "income",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await activityService.getAllActivities();
      if (response.success && response.activities.length > 0) {
        setActivities(response.activities);
        setFormData((prev) => ({
          ...prev,
          activityId: response.activities[0]._id,
        }));
      }
    } catch (error) {
      console.error("Erreur chargement activités:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.activityId) {
      alert("Veuillez sélectionner une activité");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Veuillez saisir un montant valide");
      return;
    }

    if (!formData.category) {
      alert("Veuillez saisir une catégorie");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Ajouter les champs texte
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Ajouter le fichier si sélectionné
      if (selectedFile) {
        formDataToSend.append("document", selectedFile);
      }

      // Envoyer la requête
      const response = await api.post(
        `/transactions/activity/${formData.activityId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        alert("Transaction créée avec succès !");
        navigate("/transactions");
      }
    } catch (error) {
      console.error("Erreur création transaction:", error);
      alert("Erreur lors de la création de la transaction");
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    income: ["Vente", "Service", "Location", "Prêt", "Don", "Autre revenu"],
    expense: [
      "Achat",
      "Salaire",
      "Loyer",
      "Équipement",
      "Transport",
      "Communication",
      "Autre dépense",
    ],
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/transactions"
              className="text-primary hover:underline mr-4"
            >
              <i className="fas fa-arrow-left"></i>
            </Link>
            <h1 className="text-3xl font-inter font-bold text-textPrimary">
              <i className="fas fa-plus-circle mr-3 text-primary"></i>
              Nouvelle transaction
            </h1>
          </div>
          <p className="text-textSecondary">
            Enregistrez une nouvelle entrée ou sortie d'argent
          </p>
        </div>

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Sélection de l'activité */}
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  <i className="fas fa-briefcase mr-2"></i>
                  Activité concernée*
                </label>
                <select
                  name="activityId"
                  value={formData.activityId}
                  onChange={handleChange}
                  className="input-field"
                  required
                  disabled={loading || activities.length === 0}
                >
                  {activities.length === 0 ? (
                    <option value="">Aucune activité disponible</option>
                  ) : (
                    activities.map((activity) => (
                      <option key={activity._id} value={activity._id}>
                        {activity.name} - {activity.manager}
                      </option>
                    ))
                  )}
                </select>
                {activities.length === 0 && (
                  <p className="text-xs text-danger mt-1">
                    Créez d'abord une activité pour pouvoir ajouter des
                    transactions
                  </p>
                )}
              </div>

              {/* Type de transaction */}
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  Type de transaction*
                </label>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="income"
                      checked={formData.type === "income"}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={loading}
                    />
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-success rounded-full mr-2"></div>
                      <span className="text-success font-medium">
                        Gain (Entrée d'argent)
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={formData.type === "expense"}
                      onChange={handleChange}
                      className="mr-2"
                      disabled={loading}
                    />
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-danger rounded-full mr-2"></div>
                      <span className="text-danger font-medium">
                        Dépense (Sortie d'argent)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Montant et Catégorie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Montant (FCFA)*
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      disabled={loading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <span
                        className={
                          formData.type === "income"
                            ? "text-success"
                            : "text-danger"
                        }
                      >
                        {formData.type === "income" ? "+" : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Catégorie*
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories[formData.type].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date et Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">
                    <i className="fas fa-align-left mr-2"></i>
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Description de la transaction..."
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Document justificatif */}
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  <i className="fas fa-file-upload mr-2"></i>
                  Document justificatif (facultatif)
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="document"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.svg"
                    disabled={loading}
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      {selectedFile ? (
                        <>
                          <i className="fas fa-file-check text-4xl text-success mb-2"></i>
                          <p className="text-textPrimary font-medium">
                            Fichier sélectionné
                          </p>
                          <div className="mt-2 bg-background p-3 rounded w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <i className="fas fa-file text-primary mr-3"></i>
                                <span className="text-sm">{fileName}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedFile(null);
                                  setFileName("");
                                }}
                                className="text-danger hover:text-danger/80"
                                disabled={loading}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-cloud-upload-alt text-4xl text-textSecondary mb-2"></i>
                          <p className="text-textPrimary font-medium mb-1">
                            Cliquez pour télécharger un document
                          </p>
                          <p className="text-sm text-textSecondary">
                            Facture, reçu, justificatif...
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-8 pt-6 border-t border-border flex justify-end space-x-4">
              <Link
                to="/transactions"
                className="btn-outline flex items-center"
              >
                <i className="fas fa-times mr-2"></i>
                Annuler
              </Link>

              <button
                type="submit"
                disabled={loading || activities.length === 0}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Créer la transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Aide */}
        <div className="mt-8 bg-background p-4 rounded-lg border border-border">
          <h3 className="text-sm font-medium text-textPrimary mb-2 flex items-center">
            <i className="fas fa-info-circle mr-2 text-primary"></i>
            Comment enregistrer une transaction
          </h3>
          <ul className="text-xs text-textSecondary space-y-1">
            <li>• Sélectionnez l'activité concernée par la transaction</li>
            <li>
              • Indiquez s'il s'agit d'un gain (argent qui entre) ou d'une
              dépense (argent qui sort)
            </li>
            <li>
              • Saisissez le montant exact et choisissez une catégorie
              pertinente
            </li>
            <li>
              • Ajoutez un document justificatif pour garder une trace
              (facultatif mais recommandé)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;
