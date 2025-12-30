// ✅ CORRECTION des imports au début de NewActivity.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { activityAPI } from "../services/api"; // ✅ Utiliser activityAPI directement
import { authService } from "../services/authService";

// Le reste du composant reste identique...

const NewActivity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(authService.getCurrentUser());

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manager: "",
    sector: "",
    defaultCurrency: "FCFA",
    city: "",
    country: "Cameroun",
    managerEmail: "",
    managerPhone: "",
    initialAmount: "",
    initialAmountType: "none",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Effacer les messages d'erreur quand l'utilisateur modifie
    if (errorMessage) setErrorMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Le fichier est trop volumineux (max 10MB)");
        return;
      }

      // Vérifier l'extension
      const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "txt",
        "svg",
      ];
      const fileExtension = file.name.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        setErrorMessage(
          "Type de fichier non autorisé. Formats acceptés: images, PDF, Word, Excel, texte, SVG"
        );
        return;
      }

      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage("");
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage("Le nom de l'activité est requis");
      return false;
    }

    if (!formData.manager.trim()) {
      setErrorMessage("Le nom du responsable est requis");
      return false;
    }

    if (!formData.managerPhone.trim()) {
      setErrorMessage("Le téléphone du responsable est requis");
      return false;
    }

    if (formData.initialAmountType !== "none" && !formData.initialAmount) {
      setErrorMessage("Veuillez saisir un montant initial");
      return false;
    }

    if (
      formData.initialAmountType !== "none" &&
      parseFloat(formData.initialAmount) <= 0
    ) {
      setErrorMessage("Le montant initial doit être supérieur à 0");
      return false;
    }

    return true;
  };

  // ✅ CORRECTION de la fonction handleSubmit dans NewActivity.jsx
  // Remplacer la fonction existante par celle-ci

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    // Vérifier que l'utilisateur est connecté
    if (!user || !authService.isAuthenticated()) {
      setErrorMessage("Vous devez être connecté pour créer une activité");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Ajouter les champs texte UN PAR UN
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("manager", formData.manager);
      formDataToSend.append("sector", formData.sector || "");
      formDataToSend.append("defaultCurrency", formData.defaultCurrency);
      formDataToSend.append("city", formData.city || "");
      formDataToSend.append("country", formData.country || "");
      formDataToSend.append("managerEmail", formData.managerEmail || "");
      formDataToSend.append("managerPhone", formData.managerPhone || "");
      formDataToSend.append("initialAmount", formData.initialAmount || "0");
      formDataToSend.append("initialAmountType", formData.initialAmountType);
      formDataToSend.append("userId", user._id);

      // Ajouter le fichier si sélectionné
      if (selectedFile) {
        formDataToSend.append("document", selectedFile);
      }

      // Debug
      console.log("📤 Envoi des données:", {
        name: formData.name,
        manager: formData.manager,
        initialAmount: formData.initialAmount,
        initialAmountType: formData.initialAmountType,
        hasFile: !!selectedFile,
        userId: user._id,
      });

      // ✅ CORRECTION: Appeler directement activityAPI.create()
      const response = await activityAPI.create(formDataToSend);

      console.log("📥 Réponse API:", response);

      if (response.data.success) {
        setSuccessMessage("Activité créée avec succès !");
        setTimeout(() => {
          navigate("/activities");
        }, 2000);
      } else {
        setErrorMessage(
          response.data.message || "Erreur lors de la création de l'activité"
        );
      }
    } catch (error) {
      console.error("❌ Erreur création activité:", error);

      let errorMsg = "Erreur lors de la création de l'activité. ";

      if (error.response) {
        errorMsg +=
          error.response.data?.message || `Code: ${error.response.status}`;
      } else if (error.request) {
        errorMsg +=
          "Le serveur ne répond pas. Vérifiez que le backend est démarré.";
      } else {
        errorMsg += error.message;
      }

      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Voulez-vous vraiment annuler ? Les données saisies seront perdues."
      )
    ) {
      navigate("/activities");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center mb-3 md:mb-4">
          <Link
            to="/activities"
            className="text-primary hover:underline mr-3 md:mr-4 flex items-center"
          >
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-inter font-bold text-textPrimary">
            <i className="fas fa-plus-circle mr-2 md:mr-3 text-primary"></i>
            Nouvelle activité
          </h1>
        </div>
        <p className="text-textSecondary text-sm md:text-base">
          Remplissez les informations pour créer une nouvelle activité
        </p>

        {/* Informations utilisateur */}
        {user && (
          <div className="mt-2 inline-flex items-center bg-background px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
            <i className="fas fa-user-circle text-primary mr-1 md:mr-2"></i>
            <span className="text-textPrimary font-medium truncate max-w-[100px] md:max-w-none">
              {user.name}
            </span>
            <span className="mx-1 md:mx-2 text-textSecondary">•</span>
            <span className="text-textSecondary truncate max-w-[120px] md:max-w-none">
              {user.email}
            </span>
          </div>
        )}
      </div>

      {/* Messages d'alerte */}
      {errorMessage && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-danger/10 border border-danger/20 rounded-lg">
          <div className="flex items-start">
            <i className="fas fa-exclamation-circle text-danger mt-1 mr-2 md:mr-3"></i>
            <div className="flex-1 min-w-0">
              <p className="text-danger font-medium mb-1 text-sm md:text-base">
                Erreur
              </p>
              <p className="text-danger text-xs md:text-sm">{errorMessage}</p>
              {errorMessage.includes("backend") && (
                <div className="mt-2 text-xs">
                  <p className="mb-1">Pour démarrer le backend :</p>
                  <code className="bg-black text-white px-2 py-1 rounded text-xs">
                    cd backend && yarn dev
                  </code>
                </div>
              )}
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-danger hover:text-danger/80"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 md:mb-6 p-3 md:p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-start">
            <i className="fas fa-check-circle text-success mt-1 mr-2 md:mr-3"></i>
            <div className="flex-1">
              <p className="text-success font-medium mb-1 text-sm md:text-base">
                Succès !
              </p>
              <p className="text-success text-xs md:text-sm">
                {successMessage}
              </p>
              <p className="text-success text-xs mt-1">
                <i className="fas fa-spinner fa-spin mr-1"></i>
                Redirection vers la liste des activités...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-full lg:max-w-6xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Colonne gauche */}
            <div className="space-y-4 md:space-y-6">
              {/* INFORMATIONS PRINCIPALES */}
              <div className="card p-4 md:p-6">
                <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-info-circle mr-2 text-primary"></i>
                  INFORMATIONS PRINCIPALES
                </h3>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      <i className="fas fa-tag mr-2"></i>
                      Nom de l'activité*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field text-sm md:text-base"
                      placeholder="Ex: Cyber Café"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-textSecondary mt-1">
                      Donnez un nom clair à votre activité
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      <i className="fas fa-align-left mr-2"></i>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input-field min-h-[80px] md:min-h-[100px] resize-none text-sm md:text-base"
                      placeholder="Décrivez votre activité..."
                      disabled={loading}
                    />
                    <p className="text-xs text-textSecondary mt-1">
                      Facultatif mais recommandé
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      <i className="fas fa-industry mr-2"></i>
                      Secteur d'activité
                    </label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      className="input-field text-sm md:text-base"
                      disabled={loading}
                    >
                      <option value="">Sélectionnez un secteur</option>
                      <option value="Services">Services</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Industrie">Industrie</option>
                      <option value="Technologie">Technologie</option>
                      <option value="Restauration">Restauration</option>
                      <option value="Transport">Transport</option>
                      <option value="Immobilier">Immobilier</option>
                      <option value="Santé">Santé</option>
                      <option value="Éducation">Éducation</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      <i className="fas fa-money-bill-wave mr-2"></i>
                      Devise par défaut
                    </label>
                    <select
                      name="defaultCurrency"
                      value={formData.defaultCurrency}
                      onChange={handleChange}
                      className="input-field text-sm md:text-base"
                      disabled={loading}
                    >
                      <option value="FCFA">FCFA - Franc CFA</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                      <option value="XAF">XAF - Franc CFA BEAC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite */}
            <div className="space-y-4 md:space-y-6">
              {/* COORDONNÉES DU RESPONSABLE */}
              <div className="card p-4 md:p-6">
                <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-user-tie mr-2 text-primary"></i>
                  COORDONNÉES DU RESPONSABLE
                </h3>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-textSecondary mb-2 md:mb-3 flex items-center">
                      <i className="fas fa-id-card mr-2"></i>
                      Informations Personnelles
                    </h4>

                    <div className="space-y-2 md:space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">
                          Nom*
                        </label>
                        <input
                          type="text"
                          name="manager"
                          value={formData.manager}
                          onChange={handleChange}
                          className="input-field text-sm md:text-base"
                          placeholder="Ex: Jean Dupont"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="managerEmail"
                          value={formData.managerEmail}
                          onChange={handleChange}
                          className="input-field text-sm md:text-base"
                          placeholder="jean@exemple.com"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">
                          Téléphone*
                        </label>
                        <input
                          type="tel"
                          name="managerPhone"
                          value={formData.managerPhone}
                          onChange={handleChange}
                          className="input-field text-sm md:text-base"
                          placeholder="+237 XXX XXX XXX"
                          required
                          disabled={loading}
                        />
                        <p className="text-xs text-textSecondary mt-1">
                          Format international recommandé
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-textSecondary mb-2 md:mb-3 flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Localisation
                    </h4>

                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">
                          Ville
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="input-field text-sm md:text-base"
                          placeholder="Ex: Yaoundé"
                          disabled={loading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1">
                          Pays
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="input-field text-sm md:text-base"
                          placeholder="Cameroun"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MONTANT DE DÉPART ET DOCUMENT */}
              <div className="card p-4 md:p-6">
                <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
                  <i className="fas fa-money-bill-wave mr-2 text-primary"></i>
                  MONTANT DE DÉPART
                </h3>

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      Type de montant initial
                    </label>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="initialAmountType"
                          value="none"
                          checked={formData.initialAmountType === "none"}
                          onChange={handleChange}
                          className="mr-2"
                          disabled={loading}
                        />
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-textSecondary rounded-full mr-2"></div>
                          <span className="text-textSecondary text-sm md:text-base">
                            Aucun montant
                          </span>
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="initialAmountType"
                          value="income"
                          checked={formData.initialAmountType === "income"}
                          onChange={handleChange}
                          className="mr-2"
                          disabled={loading}
                        />
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-success rounded-full mr-2"></div>
                          <span className="text-success text-sm md:text-base">
                            Gain initial
                          </span>
                        </div>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="initialAmountType"
                          value="expense"
                          checked={formData.initialAmountType === "expense"}
                          onChange={handleChange}
                          className="mr-2"
                          disabled={loading}
                        />
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-danger rounded-full mr-2"></div>
                          <span className="text-danger text-sm md:text-base">
                            Dépense initiale
                          </span>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">
                      Sélectionnez si cette activité démarre avec un capital ou
                      une dette
                    </p>
                  </div>

                  {formData.initialAmountType !== "none" && (
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                        Montant ({formData.defaultCurrency})
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="initialAmount"
                          value={formData.initialAmount}
                          onChange={handleChange}
                          className="input-field pl-8 md:pl-10 text-sm md:text-base"
                          placeholder="0"
                          min="0"
                          step="0.01"
                          disabled={loading}
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <span
                            className={
                              formData.initialAmountType === "income"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {formData.initialAmountType === "income"
                              ? "+"
                              : "-"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-textSecondary mt-1">
                        Saisissez le montant{" "}
                        {formData.initialAmountType === "income"
                          ? "du gain"
                          : "de la dépense"}{" "}
                        initial
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1 md:mb-2">
                      <i className="fas fa-file-upload mr-2"></i>
                      Document justificatif (facultatif)
                    </label>
                    <div
                      className={`border-2 border-dashed ${
                        selectedFile ? "border-primary" : "border-border"
                      } rounded-lg p-4 md:p-6 text-center transition-colors`}
                    >
                      <input
                        type="file"
                        id="document"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.svg"
                        disabled={loading}
                      />
                      <label
                        htmlFor="document"
                        className="cursor-pointer block"
                      >
                        <div className="flex flex-col items-center">
                          {selectedFile ? (
                            <>
                              <i className="fas fa-file-check text-3xl md:text-4xl text-success mb-2"></i>
                              <p className="text-textPrimary font-medium mb-1 text-sm md:text-base">
                                Fichier sélectionné
                              </p>
                              <div className="mt-2 bg-background p-3 rounded-lg w-full">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center min-w-0">
                                    <i className="fas fa-file text-primary mr-2"></i>
                                    <div className="text-left min-w-0">
                                      <p className="text-sm font-medium truncate max-w-[150px] md:max-w-[200px]">
                                        {fileName}
                                      </p>
                                      <p className="text-xs text-textSecondary">
                                        Cliquez pour changer
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedFile(null);
                                      setFileName("");
                                      document.getElementById(
                                        "document"
                                      ).value = "";
                                    }}
                                    className="text-danger hover:text-danger/80 ml-2"
                                    disabled={loading}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-cloud-upload-alt text-3xl md:text-4xl text-textSecondary mb-2"></i>
                              <p className="text-textPrimary font-medium mb-1 text-sm md:text-base">
                                Cliquez pour télécharger un document
                              </p>
                              <p className="text-sm text-textSecondary">
                                Formats acceptés: images, PDF, Word, Excel, SVG
                              </p>
                              <p className="text-xs text-textSecondary mt-1">
                                Taille max: 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-textSecondary mt-2">
                      Ajoutez une facture, un reçu ou tout document justificatif
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border flex flex-col-reverse sm:flex-row justify-end gap-3 md:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-outline flex items-center justify-center text-sm md:text-base px-4 py-2 mt-2 sm:mt-0"
              disabled={loading}
            >
              <i className="fas fa-times mr-1 md:mr-2"></i>
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center text-sm md:text-base px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-1 md:mr-2"></i>
                  <span className="hidden sm:inline">Création en cours...</span>
                  <span className="sm:hidden">Création...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-1 md:mr-2"></i>
                  <span className="hidden sm:inline">Créer l'activité</span>
                  <span className="sm:hidden">Créer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Guide d'utilisation */}
      <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border">
        <h3 className="text-base md:text-lg font-inter font-semibold text-textPrimary mb-3 md:mb-4 flex items-center">
          <i className="fas fa-question-circle mr-2 text-primary"></i>
          Guide d'utilisation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <div className="bg-background p-3 md:p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 md:mr-3">
                <i className="fas fa-info text-primary text-sm"></i>
              </div>
              <h4 className="font-medium text-textPrimary text-sm md:text-base">
                Informations de base
              </h4>
            </div>
            <p className="text-xs md:text-sm text-textSecondary">
              Renseignez un nom clair et une description pour identifier
              facilement votre activité.
            </p>
          </div>

          <div className="bg-background p-3 md:p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-success/10 rounded-full flex items-center justify-center mr-2 md:mr-3">
                <i className="fas fa-money-bill text-success text-sm"></i>
              </div>
              <h4 className="font-medium text-textPrimary text-sm md:text-base">
                Montant initial
              </h4>
            </div>
            <p className="text-xs md:text-sm text-textSecondary">
              Indiquez si votre activité démarre avec un capital (gain) ou une
              dette (dépense).
            </p>
          </div>

          <div className="bg-background p-3 md:p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2 md:mr-3">
                <i className="fas fa-file-alt text-primary text-sm"></i>
              </div>
              <h4 className="font-medium text-textPrimary text-sm md:text-base">
                Documents
              </h4>
            </div>
            <p className="text-xs md:text-sm text-textSecondary">
              Ajoutez des justificatifs pour garder une trace de toutes vos
              transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Informations de debug (à supprimer en production) */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-background rounded-lg border border-border">
        <details className="cursor-pointer">
          <summary className="text-xs md:text-sm text-textSecondary flex items-center">
            <i className="fas fa-bug mr-2"></i>
            Informations techniques (debug)
          </summary>
          <div className="mt-3 text-xs space-y-2">
            <div>
              <span className="font-medium">Utilisateur:</span>
              <span className="ml-2">
                {user ? `${user.name} (${user.email})` : "Non connecté"}
              </span>
            </div>
            <div>
              <span className="font-medium">Token:</span>
              <span className="ml-2">
                {authService.getToken() ? "Présent" : "Absent"}
              </span>
            </div>
            <div>
              <span className="font-medium">API URL:</span>
              <span className="ml-2">https://chedjou-app.onrender.com</span>
            </div>
            <div>
              <span className="font-medium">Fichier sélectionné:</span>
              <span className="ml-2">
                {selectedFile
                  ? `${fileName} (${(selectedFile.size / 1024).toFixed(2)} KB)`
                  : "Aucun"}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <button
                onClick={() => {
                  console.log("FormData:", formData);
                  console.log("Selected File:", selectedFile);
                  console.log("User:", user);
                }}
                className="text-primary hover:underline text-xs"
              >
                Afficher les données dans la console
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* Footer */}
      <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-border text-center text-textSecondary text-xs md:text-sm">
        <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
        <p className="mt-1 text-xs">
          Développé avec <i className="fas fa-heart text-danger mx-1"></i> pour
          la gestion d'activités multiples
        </p>
      </footer>
    </div>
  );
};

export default NewActivity;
