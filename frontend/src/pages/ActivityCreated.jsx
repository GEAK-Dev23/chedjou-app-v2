import React from "react";
import { Link } from "react-router-dom";

const ActivityCreated = () => {
  return (
    <div className="p-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
            <i className="fas fa-check-circle text-success text-4xl"></i>
          </div>

          <h1 className="text-3xl font-inter font-bold text-textPrimary mb-2">
            Nouvelle activité
          </h1>

          <div className="inline-flex items-center bg-success/10 text-success px-4 py-2 rounded-full mb-6">
            <i className="fas fa-check mr-2"></i>
            Activité ajoutée avec succès
          </div>
        </div>

        <div className="card text-center">
          <p className="text-textSecondary mb-6">
            Votre nouvelle activité a été créée avec succès. Vous pouvez
            maintenant ajouter des transactions, gérer les documents et suivre
            les performances.
          </p>

          <div className="space-y-4">
            <Link
              to="/activities"
              className="btn-primary w-full flex items-center justify-center"
            >
              <i className="fas fa-eye mr-2"></i>
              Voir l'activité
            </Link>

            <div className="flex space-x-4">
              <Link
                to="/activities/new"
                className="btn-outline flex-1 flex items-center justify-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Nouvelle activité
              </Link>

              <Link
                to="/dashboard"
                className="btn-outline flex-1 flex items-center justify-center"
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Tableau de bord
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-textSecondary text-sm">
          <p>© 2025 CHEDJOU APP. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  );
};

export default ActivityCreated;
