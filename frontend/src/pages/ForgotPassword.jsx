import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
        setMessage(
          response.message ||
            "Un nouveau mot de passe a été généré et envoyé à votre adresse email."
        );

        // Redirection automatique après 5 secondes
        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setError(response.message || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error("❌ Erreur réinitialisation mot de passe:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erreur de connexion au serveur"
      );
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
            <i className="fas fa-key text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-textSecondary">
            Entrez votre adresse email pour réinitialiser votre mot de passe
          </p>
        </div>

        {/* Formulaire */}
        <div className="card">
          {success ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>

              <h3 className="text-xl font-semibold text-green-700">Succès !</h3>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">{message}</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-textSecondary">
                  Vous allez être redirigé vers la page de connexion dans 5
                  secondes...
                </p>

                <Link
                  to="/login"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-2">
                  <i className="fas fa-envelope mr-2"></i>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="votre@email.com"
                  required
                />
                <p className="text-xs text-textSecondary mt-1">
                  Un nouveau mot de passe sera généré et envoyé à cette adresse.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-start">
                    <i className="fas fa-exclamation-circle text-red-500 mt-0.5 mr-2"></i>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {message && !error && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-start">
                    <i className="fas fa-info-circle text-blue-500 mt-0.5 mr-2"></i>
                    <p className="text-blue-700 text-sm">{message}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Réinitialiser le mot de passe
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-border">
                <Link
                  to="/login"
                  className="text-primary hover:underline flex items-center justify-center"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Retour à la page de connexion
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-textSecondary text-sm">
          <p>© 2024 CHEDJOU APP. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default ForgotPassword;
