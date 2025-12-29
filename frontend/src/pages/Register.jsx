import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Redirection vers la page de succès
      navigate("/register-success");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* En-tête avec icône */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-inter font-bold text-primary mb-2">
            CHEDJOU APP
          </h1>
          <h2 className="text-2xl font-inter font-semibold text-textPrimary">
            Inscription
          </h2>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle text-danger mr-2"></i>
              <p className="text-danger text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Nom */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-user mr-2"></i>
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Charles Domngang"
                required
              />
            </div>

            {/* Champ Email */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-envelope mr-2"></i>
                Adresse mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-lock mr-2"></i>
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Champ Confirmation mot de passe */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-lock mr-2"></i>
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Bouton Inscription */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Inscription en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus mr-2"></i>
                  S'inscrire
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lien vers connexion */}
        <div className="text-center mt-6">
          <p className="text-textSecondary">
            Vous avez déjà un compte?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              <i className="fas fa-sign-in-alt mr-1"></i>
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-textSecondary text-sm">
          <p>© 2024 CHEDJOU APP. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default Register;
