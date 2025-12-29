import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { activityAPI } from "../services/api";

const EditActivity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    managerEmail: "",
    managerPhone: "",
    city: "",
    country: "",
    sector: "",
    defaultCurrency: "FCFA",
    initialAmount: 0,
    initialAmountType: "none",
  });

  // Charger les données de l'activité
  useEffect(() => {
    loadActivityData();
  }, [id]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      const response = await activityAPI.getById(id);

      if (response.data.success) {
        const activity = response.data.activity;

        setFormData({
          name: activity.name || "",
          description: activity.description || "",
          manager: activity.manager || "",
          managerEmail: activity.contact?.email || "",
          managerPhone: activity.contact?.phone || "",
          city: activity.location?.city || "",
          country: activity.location?.country || "",
          sector: activity.sector || "",
          defaultCurrency: activity.defaultCurrency || "FCFA",
          initialAmount: activity.initialAmount || 0,
          initialAmountType: activity.initialAmountType || "none",
        });
      } else {
        throw new Error(response.data.message || "Activité non trouvée");
      }
    } catch (error) {
      console.error("❌ Erreur chargement activité:", error);
      setError("Impossible de charger les données de l'activité");
      setTimeout(() => {
        navigate("/activities");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 10MB)");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.manager) {
      alert("Veuillez remplir le nom de l'activité et le responsable");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Préparer les données
      const activityData = {
        name: formData.name,
        description: formData.description,
        manager: formData.manager,
        sector: formData.sector,
        defaultCurrency: formData.defaultCurrency,
        location: {
          city: formData.city,
          country: formData.country,
        },
        contact: {
          email: formData.managerEmail,
          phone: formData.managerPhone,
        },
        initialAmount: parseFloat(formData.initialAmount) || 0,
        initialAmountType: formData.initialAmountType,
      };

      const response = await activityAPI.update(id, activityData, file);

      if (response.data.success) {
        alert("✅ Activité mise à jour avec succès");
        navigate(`/activities/${id}`);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("❌ Erreur mise à jour:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Erreur lors de la mise à jour"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-textSecondary">Chargement de l'activité...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full mb-4 md:mb-6">
            <i className="fas fa-exclamation-triangle text-white text-2xl md:text-3xl"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-red-600 mb-2">
            Erreur
          </h1>
          <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
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

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-4 lg:p-8">
      <div className="max-w-full lg:max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 md:mb-8">
          <Link
            to={`/activities/${id}`}
            className="text-primary hover:underline flex items-center mb-3 md:mb-4 text-sm md:text-base"
          >
            <i className="fas fa-arrow-left mr-1 md:mr-2"></i>
            Retour à l'activité
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-inter font-bold text-textPrimary mb-1 md:mb-2">
            <i className="fas fa-edit mr-2 md:mr-3 text-primary"></i>
            Modifier l'activité
          </h1>
          <p className="text-textSecondary text-sm md:text-base">
            Modifiez les informations de votre activité
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-xl shadow border border-border p-4 md:p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 md:space-y-6">
              {/* Informations principales */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-info-circle mr-2 text-primary"></i>
                  INFORMATIONS PRINCIPALES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Nom de l'activité *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Secteur d'activité
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      placeholder="Ex: Commerce, Services, Industrie..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input-field w-full min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base"
                      placeholder="Description de l'activité..."
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées du responsable */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-user-tie mr-2 text-primary"></i>
                  COORDONNÉES DU RESPONSABLE
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Nom du responsable *
                    </label>
                    <input
                      type="text"
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="managerEmail"
                      value={formData.managerEmail}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      placeholder="email@exemple.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      name="managerPhone"
                      value={formData.managerPhone}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      placeholder="+237 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Devise par défaut
                    </label>
                    <select
                      name="defaultCurrency"
                      value={formData.defaultCurrency}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                    >
                      <option value="FCFA">FCFA - Franc CFA</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                      <option value="XAF">XAF - Franc CFA</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-map-marker-alt mr-2 text-primary"></i>
                  LOCALISATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      placeholder="Ex: Yaoundé, Douala..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                      placeholder="Ex: Cameroun"
                      defaultValue="Cameroun"
                    />
                  </div>
                </div>
              </div>

              {/* Montant initial */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-money-bill-wave mr-2 text-primary"></i>
                  MONTANT INITIAL (FACULTATIF)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Type
                    </label>
                    <select
                      name="initialAmountType"
                      value={formData.initialAmountType}
                      onChange={handleChange}
                      className="input-field w-full text-sm md:text-base"
                    >
                      <option value="none">Aucun montant initial</option>
                      <option value="income">Gain initial</option>
                      <option value="expense">Dépense initiale</option>
                    </select>
                  </div>

                  {formData.initialAmountType !== "none" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                          Montant ({formData.defaultCurrency})
                        </label>
                        <input
                          type="number"
                          name="initialAmount"
                          value={formData.initialAmount}
                          onChange={handleChange}
                          className="input-field w-full text-sm md:text-base"
                          min="0"
                          step="0.01"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                          Document justificatif
                        </label>
                        <div className="border-2 border-dashed border-border rounded-lg p-3 md:p-4 text-center hover:bg-background transition-colors">
                          <input
                            type="file"
                            id="document"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                          />
                          <label htmlFor="document" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <i className="fas fa-cloud-upload-alt text-xl md:text-2xl text-textSecondary mb-2"></i>
                              <p className="text-sm text-textSecondary">
                                {file
                                  ? file.name
                                  : "Cliquez pour télécharger un document"}
                              </p>
                              <p className="text-xs text-textSecondary mt-1">
                                Formats acceptés: JPG, PNG, PDF, DOC, XLS (max
                                10MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="mt-6 md:mt-8 pt-6 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4">
              <Link
                to={`/activities/${id}`}
                className="btn-outline flex items-center justify-center text-sm md:text-base px-4 py-2 mt-2 sm:mt-0"
                disabled={saving}
              >
                <i className="fas fa-times mr-1 md:mr-2"></i>
                Annuler
              </Link>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center text-sm md:text-base px-4 py-2"
                disabled={saving || !formData.name || !formData.manager}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1 md:mr-2"></i>
                    <span className="hidden sm:inline">Enregistrement...</span>
                    <span className="sm:hidden">Enregistrement</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-1 md:mr-2"></i>
                    <span className="hidden sm:inline">
                      Enregistrer les modifications
                    </span>
                    <span className="sm:hidden">Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border text-center text-textSecondary text-xs md:text-sm">
          <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default EditActivity;
