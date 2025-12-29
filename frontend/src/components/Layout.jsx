import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-primary/10 text-primary"
      : "text-textSecondary hover:bg-background";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border shadow-sm">
        <div className="p-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            <h1 className="text-2xl font-inter font-bold text-primary">
              CHEDJOU APP
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {/* Tableau de bord */}
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/dashboard"
              )}`}
            >
              <i className="fas fa-tachometer-alt mr-3 w-5"></i>
              Tableau de bord
            </Link>

            {/* Mes Activités */}
            <Link
              to="/activities"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/activities"
              )}`}
            >
              <i className="fas fa-briefcase mr-3 w-5"></i>
              Mes Activités
            </Link>

            {/* Historique des transactions */}
            <Link
              to="/transactions"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/transactions"
              )}`}
            >
              <i className="fas fa-exchange-alt mr-3 w-5"></i>
              Historique des transactions
            </Link>

            {/* Documents */}
            <Link
              to="/documents"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/documents"
              )}`}
            >
              <i className="fas fa-file-alt mr-3 w-5"></i>
              Documents
            </Link>
          </nav>

          {/* Déconnexion */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 rounded-lg text-danger hover:bg-danger/10 w-full transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-3 w-5"></i>
              Déconnexion
            </button>

            {/* Info utilisateur */}
            {user && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-textPrimary">
                      {user.name}
                    </p>
                    <p className="text-xs text-textSecondary">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="ml-64">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
