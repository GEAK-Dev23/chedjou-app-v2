import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { authService } from "./services/authService";

// Importer directement les pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import LoginFailed from "./pages/LoginFailed";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Activities from "./pages/Activities";
import ActivityDetail from "./pages/ActivityDetail";
import NewActivity from "./pages/NewActivity";
import EditActivity from "./pages/EditActivity";
import ActivityCreated from "./pages/ActivityCreated";
import Transactions from "./pages/Transactions";
import NewTransaction from "./pages/NewTransaction";
import Documents from "./pages/Documents";

// Layout principal
import Layout from "./components/Layout";

// Configuration API - IMPORTANT : URL de production
const API_URL =
  import.meta.env.VITE_API_URL || "https://chedjou-app.onrender.com";
console.log(`🔧 Configuration API: ${API_URL}`);

// Composant de chargement
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 animate-pulse">
        <i className="fas fa-spinner fa-spin text-white text-3xl"></i>
      </div>
      <h1 className="text-3xl font-bold text-blue-600 mb-4">CHEDJOU APP</h1>
      <p className="text-gray-600 mb-6">
        {message || "Chargement en cours..."}
      </p>
      <div className="space-y-3 text-left bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <i className="fas fa-server text-blue-600 mr-3"></i>
          <span>Connexion à l'API...</span>
        </div>
        <div className="flex items-center">
          <i className="fas fa-database text-blue-600 mr-3"></i>
          <span>Vérification de la base de données...</span>
        </div>
        <div className="flex items-center">
          <i className="fas fa-user-check text-blue-600 mr-3"></i>
          <span>Vérification de l'authentification...</span>
        </div>
      </div>
    </div>
  </div>
);

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      setChecking(false);
    };
    checkAuth();
  }, []);

  if (checking) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Composant pour les routes publiques
const PublicRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = authService.isAuthenticated();
      setIsAuthenticated(authStatus);
      setChecking(false);
    };
    checkAuth();
  }, []);

  if (checking) {
    return <LoadingScreen message="Vérification de l'authentification..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Composant pour vérifier l'état de l'API
const ApiStatus = () => {
  const [apiStatus, setApiStatus] = useState({
    connected: false,
    loading: true,
  });

  useEffect(() => {
    const checkApi = async () => {
      try {
        // ✅ CORRIGÉ : URL dynamique
        const response = await fetch(`${API_URL}/api/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const isConnected = response.ok;
        setApiStatus({ connected: isConnected, loading: false });

        if (!isConnected) {
          console.log("⚠️ API non disponible");
        }
      } catch (error) {
        console.error("Erreur vérification API:", error);
        setApiStatus({ connected: false, loading: false });
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => clearInterval(interval);
  }, []);

  if (apiStatus.loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-3 shadow-lg z-50 animate-pulse">
        <div className="flex items-center">
          <i className="fas fa-spinner fa-spin text-blue-600 mr-2"></i>
          <span className="text-sm">Connexion API...</span>
        </div>
      </div>
    );
  }

  if (!apiStatus.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-50 max-w-xs">
        <div className="flex items-start">
          <i className="fas fa-exclamation-triangle text-red-600 mt-1 mr-2"></i>
          <div>
            <p className="text-sm font-medium text-red-600 mb-1">
              API non disponible
            </p>
            <p className="text-xs text-red-600">
              {/* ✅ CORRIGÉ : Message adapté à la production */}
              Le backend Render ne répond pas. Vérifiez que le service est
              démarré sur{" "}
              <a
                href="https://dashboard.render.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-700"
              >
                dashboard.render.com
              </a>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-blue-600 hover:underline mt-2 flex items-center"
            >
              <i className="fas fa-sync-alt mr-1"></i>
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center">
        <i className="fas fa-check-circle text-green-600 mr-2"></i>
        <span className="text-sm text-green-600">API connectée</span>
      </div>
    </div>
  );
};

// Composant DebugInfo corrigé
const DebugInfo = () => {
  const [showDebug, setShowDebug] = useState(false);

  // Toujours désactiver en production
  const isProduction = import.meta.env.MODE === "production";

  if (isProduction) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow-lg z-50 hover:bg-gray-50 transition-colors"
        title="Debug Info"
      >
        <i className="fas fa-bug text-gray-600"></i>
      </button>

      {showDebug && (
        <div className="fixed bottom-16 left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 max-w-xs">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Informations de debug
            </h4>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium">Route actuelle:</span>
              <span className="ml-2 text-gray-600">
                {window.location.pathname}
              </span>
            </div>
            <div>
              <span className="font-medium">Authentifié:</span>
              <span
                className={`ml-2 ${
                  authService.isAuthenticated()
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {authService.isAuthenticated() ? "Oui" : "Non"}
              </span>
            </div>
            <div>
              <span className="font-medium">Token:</span>
              <span className="ml-2 text-gray-600">
                {authService.getToken() ? "Présent" : "Absent"}
              </span>
            </div>
            <div>
              <span className="font-medium">API URL:</span>
              {/* ✅ CORRIGÉ : URL dynamique */}
              <span className="ml-2 text-gray-600">{API_URL}</span>
            </div>
            <div>
              <span className="font-medium">Mode:</span>
              <span className="ml-2 text-gray-600">
                {import.meta.env.MODE || "development"}
              </span>
            </div>
            <div>
              <span className="font-medium">Environnement:</span>
              <span className="ml-2 text-gray-600">
                {API_URL.includes("localhost") ? "Développement" : "Production"}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log("État actuel:", {
                    user: authService.getCurrentUser(),
                    token: authService.getToken(),
                    path: window.location.pathname,
                    apiUrl: API_URL,
                    timestamp: new Date().toISOString(),
                    mode: import.meta.env.MODE,
                  });
                }}
                className="text-blue-600 hover:underline text-xs flex items-center"
              >
                <i className="fas fa-terminal mr-1"></i>
                Log dans la console
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Composant pour la page 404
const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
          <i className="fas fa-map-signs text-white text-3xl"></i>
        </div>

        <h1 className="text-4xl font-bold text-blue-600 mb-2">404</h1>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page non trouvée
        </h2>

        <p className="text-gray-600 mb-8 max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-tachometer-alt mr-2"></i>
            Tableau de bord
          </Link>

          <Link
            to="/activities"
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
          >
            <i className="fas fa-briefcase mr-2"></i>
            Mes activités
          </Link>
        </div>

        <div className="mt-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:underline flex items-center"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Retour à la page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant principal des routes
const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/register-success"
        element={
          <PublicRoute>
            <RegisterSuccess />
          </PublicRoute>
        }
      />

      <Route
        path="/login-failed"
        element={
          <PublicRoute>
            <LoginFailed />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activities" element={<Activities />} />
        <Route path="activities/new" element={<NewActivity />} />
        <Route path="activities/:id" element={<ActivityDetail />} />
        <Route path="activities/:id/edit" element={<EditActivity />} />
        <Route path="activity-created" element={<ActivityCreated />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/new" element={<NewTransaction />} />
        <Route path="documents" element={<Documents />} />
        <Route path="documents/:id" element={<Documents />} />
      </Route>

      {/* Page 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Composant principal de l'application
function AppContent() {
  const [initError, setInitError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const initializeApp = async () => {
      try {
        console.log("🚀 Initialisation de CHEDJOU APP...");
        console.log(`🔧 URL backend: ${API_URL}`);

        // Tester la connexion API
        console.log("🔗 Test de connexion API...");
        try {
          // ✅ CORRIGÉ : URL dynamique
          const response = await fetch(`${API_URL}/api/health`);
          if (!response.ok) {
            throw new Error(`API response: ${response.status}`);
          }
          const data = await response.json();
          console.log("✅ API connectée avec succès:", data.status);
        } catch (apiError) {
          console.warn("⚠️ API non disponible:", apiError.message);
          // On continue quand même
        }

        // Vérifier l'authentification
        const isAuthenticated = authService.isAuthenticated();
        const currentUser = authService.getCurrentUser();

        if (isAuthenticated && currentUser) {
          console.log(
            `✅ Utilisateur connecté: ${currentUser.name} (${currentUser.email})`
          );
        } else {
          console.log("ℹ️  Utilisateur non authentifié");
        }

        setInitialized(true);
      } catch (error) {
        console.error("❌ Erreur d'initialisation:", error);
        setInitError({
          title: "Erreur d'initialisation",
          message: "Une erreur est survenue lors du démarrage :",
          details: [
            error.message || "Erreur inconnue",
            `URL API: ${API_URL}`,
            "Vérifiez que le backend Render est démarré",
          ],
        });
        setInitialized(true);
      }
    };

    // Délai pour éviter les problèmes de chargement
    setTimeout(initializeApp, 100);
  }, [initialized]);

  // Écran de chargement
  if (!initialized) {
    return <LoadingScreen message="Initialisation de l'application..." />;
  }

  // Écran d'erreur d'initialisation
  if (initError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
            <i className="fas fa-exclamation-triangle text-white text-3xl"></i>
          </div>

          <h1 className="text-2xl font-bold text-red-600 mb-2">
            {initError.title}
          </h1>

          <p className="text-gray-600 mb-6">{initError.message}</p>

          <div className="bg-white border border-gray-200 rounded-lg p-4 text-left mb-6">
            <ul className="space-y-2 text-sm text-gray-600">
              {initError.details.map((detail, index) => (
                <li key={index} className="flex items-start">
                  <i className="fas fa-circle text-xs mt-1 mr-2 text-blue-600"></i>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Réessayer
            </button>

            {/* ✅ CORRIGÉ : Lien vers Render dashboard */}
            <a
              href="https://dashboard.render.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center w-full"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Vérifier le backend sur Render
            </a>
          </div>

          <div className="mt-8 text-xs text-gray-600">
            <p className="mb-1">Informations techniques :</p>
            <div className="bg-gray-900 text-white p-3 rounded font-mono text-xs overflow-x-auto">
              # Configuration actuelle
              <br />
              URL API: {API_URL}
              <br />
              Frontend: {window.location.origin}
              <br />
              <br />
              # Pour développement local
              <br />
              Backend: cd backend && yarn dev
              <br />
              Frontend: cd frontend && yarn dev
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={<LoadingScreen message="Chargement de l'application..." />}
    >
      <Router>
        <AppRoutes />
      </Router>

      {/* Composants de débogage */}
      <ApiStatus />
      <DebugInfo />
    </Suspense>
  );
}

// Composant racine avec Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔥 Erreur React:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
              <i className="fas fa-bug text-white text-3xl"></i>
            </div>

            <h1 className="text-2xl font-bold text-red-600 mb-2">
              Erreur d'application
            </h1>

            <p className="text-gray-600 mb-4">
              Une erreur s'est produite dans l'application.
            </p>

            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 font-mono overflow-x-auto">
                {this.state.error?.toString() || "Erreur inconnue"}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center w-full"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Recharger l'application
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/login";
                }}
                className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center w-full"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Se déconnecter et réessayer
              </button>
            </div>

            <div className="mt-8 text-xs text-gray-600">
              <p>Si le problème persiste :</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Vérifiez la console du navigateur (F12)</li>
                <li>Effacez le cache du navigateur</li>
                <li>Contactez le support technique</li>
              </ol>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Composant principal exporté
function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
