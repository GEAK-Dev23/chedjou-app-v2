import React from "react";
import { Link } from "react-router-dom";

const RegisterSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Icône de succès */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
          <i className="fas fa-check-circle text-success text-4xl"></i>
        </div>

        {/* Message */}
        <h1 className="text-4xl font-inter font-bold text-success mb-4">
          CHEDJOU APP
        </h1>
        <h2 className="text-3xl font-inter font-semibold text-textPrimary mb-6">
          Inscription réussie
        </h2>

        <div className="card max-w-sm mx-auto">
          <p className="text-textSecondary mb-6">
            Votre compte a été créé avec succès. Vous pouvez maintenant vous
            connecter et commencer à gérer vos activités.
          </p>

          <div className="space-y-4">
            <Link
              to="/login"
              className="btn-primary w-full flex items-center justify-center"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Se connecter
            </Link>

            <Link
              to="/"
              className="inline-flex items-center text-primary hover:underline"
            >
              <i className="fas fa-home mr-2"></i>
              Retour à l'accueil
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-textSecondary text-sm">
          <p>© 2024 CHEDJOU APP. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default RegisterSuccess;
