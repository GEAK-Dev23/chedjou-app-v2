import React, { useState } from "react";
import { Link } from "react-router-dom";

const LoginFailed = () => {
  const [email, setEmail] = useState("goufanarmelgeak@gmail.com");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* En-tête avec icône d'alerte */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-danger/10 rounded-full mb-4">
            <i className="fas fa-exclamation-triangle text-danger text-2xl"></i>
          </div>
          <h1 className="text-4xl font-inter font-bold text-primary mb-2">
            CHEDJOU APP
          </h1>
          <h2 className="text-2xl font-inter font-semibold text-danger">
            Accès refusé
          </h2>
        </div>

        {/* Formulaire avec erreur */}
        <div className="card">
          <form className="space-y-6">
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
                className="input-field border-danger/30"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Champ Mot de passe avec erreur */}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-2">
                <i className="fas fa-lock mr-2"></i>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field border-danger"
                placeholder="••••••••"
                required
              />

              {/* Message d'erreur */}
              <div className="mt-2 flex items-center text-danger text-sm">
                <i className="fas fa-times-circle mr-2"></i>
                Mot de passe incorrect
              </div>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              className="btn-danger w-full flex items-center justify-center"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Se connecter
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

export default LoginFailed;
