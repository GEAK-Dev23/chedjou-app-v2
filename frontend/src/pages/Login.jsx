import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ email, password });
      // Redirection vers le tableau de bord
      navigate("/dashboard");
    } catch (err) {
      // En cas d'erreur, rediriger vers la page d'erreur
      navigate("/login-failed");
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
            <i className="fas fa-chart-line text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-inter font-bold text-primary mb-2">
            CHEDJOU APP
          </h1>
          <h2 className="text-2xl font-inter font-semibold text-textPrimary">
            Connexion
          </h2>
        </div>

        {/* Formulaire */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Champ Email */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-envelope mr-2"></i>
                Adresse mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Se connecter
                </>
              )}
            </button>

            {/* Lien mot de passe oublié */}
            <div className="text-center pt-2">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline text-sm"
              >
                <i className="fas fa-key mr-1"></i>
                Mot de passe oublié?
              </Link>
            </div>
          </form>
        </div>

        {/* Lien vers inscription */}
        <div className="text-center mt-6">
          <p className="text-textSecondary">
            Pas de compte?{" "}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              <i className="fas fa-user-plus mr-1"></i>
              S'inscrire
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

export default Login;
