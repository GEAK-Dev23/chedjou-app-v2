// frontend/src/components/Layout.jsx - VERSION AVEC ADMIN
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-primary/10 text-primary"
      : "text-textSecondary hover:bg-background";
  };

  // ✅ Vérifier si l'utilisateur est admin
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-surface border-r border-border shadow-sm transition-all duration-300 z-50`}
      >
        <div className="p-6">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            {sidebarOpen && (
              <h1 className="text-2xl font-inter font-bold text-primary">
                CHEDJOU APP
              </h1>
            )}
          </Link>

          {/* Toggle Sidebar */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-6 -right-3 bg-white border border-border rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-50"
          >
            <i
              className={`fas fa-chevron-${
                sidebarOpen ? "left" : "right"
              } text-xs`}
            ></i>
          </button>

          {/* Badge Rôle */}
          {user && sidebarOpen && (
            <div
              className={`mb-6 px-3 py-2 rounded-lg ${
                isAdmin ? "bg-primary/10" : "bg-blue-50"
              }`}
            >
              <div className="flex items-center">
                <i
                  className={`fas ${isAdmin ? "fa-crown" : "fa-user-tie"} ${
                    isAdmin ? "text-primary" : "text-blue-600"
                  } mr-2`}
                ></i>
                <span
                  className={`text-sm font-medium ${
                    isAdmin ? "text-primary" : "text-blue-600"
                  }`}
                >
                  {isAdmin ? "Administrateur" : "Manager"}
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {/* ✅ MENU ADMIN UNIQUEMENT */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                    "/admin"
                  )}`}
                  title={!sidebarOpen ? "Administration" : ""}
                >
                  <i className="fas fa-crown mr-3 w-5"></i>
                  {sidebarOpen && <span>Administration</span>}
                </Link>

                <div className="border-t border-border my-2"></div>
              </>
            )}

            {/* Tableau de bord */}
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/dashboard"
              )}`}
              title={!sidebarOpen ? "Tableau de bord" : ""}
            >
              <i className="fas fa-tachometer-alt mr-3 w-5"></i>
              {sidebarOpen && <span>Tableau de bord</span>}
            </Link>

            {/* Mes Activités */}
            <Link
              to="/activities"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/activities"
              )}`}
              title={!sidebarOpen ? "Mes Activités" : ""}
            >
              <i className="fas fa-briefcase mr-3 w-5"></i>
              {sidebarOpen && (
                <span>{isAdmin ? "Toutes les Activités" : "Mon Activité"}</span>
              )}
            </Link>

            {/* Transactions */}
            <Link
              to="/transactions"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/transactions"
              )}`}
              title={!sidebarOpen ? "Transactions" : ""}
            >
              <i className="fas fa-exchange-alt mr-3 w-5"></i>
              {sidebarOpen && <span>Transactions</span>}
            </Link>

            {/* Documents */}
            <Link
              to="/documents"
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive(
                "/documents"
              )}`}
              title={!sidebarOpen ? "Documents" : ""}
            >
              <i className="fas fa-file-alt mr-3 w-5"></i>
              {sidebarOpen && <span>Documents</span>}
            </Link>
          </nav>

          {/* Déconnexion */}
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 rounded-lg text-danger hover:bg-danger/10 w-full transition-colors"
              title={!sidebarOpen ? "Déconnexion" : ""}
            >
              <i className="fas fa-sign-out-alt mr-3 w-5"></i>
              {sidebarOpen && <span>Déconnexion</span>}
            </button>

            {/* Info utilisateur */}
            {user && sidebarOpen && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 ${
                      isAdmin ? "bg-primary" : "bg-blue-600"
                    } rounded-full flex items-center justify-center mr-3`}
                  >
                    <i
                      className={`fas ${
                        isAdmin ? "fa-crown" : "fa-user"
                      } text-white text-sm`}
                    ></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-textPrimary truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-textSecondary truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div
        className={`${
          sidebarOpen ? "ml-64" : "ml-20"
        } transition-all duration-300`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
