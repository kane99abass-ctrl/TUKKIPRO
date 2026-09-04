import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';

// Layouts
import PublicLayout from './layouts/PublicLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import AgencyLayout from './layouts/AgencyLayout.jsx';

// Pages Publiques
import LandingPage from './pages/public/LandingPage.jsx';
import PricingPage from './pages/public/PricingPage.jsx';
import FeaturesPage from './pages/public/FeaturesPage.jsx';

// Pages Authentification
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';

// Pages Agence
import DashboardPage from './pages/agency/DashboardPage.jsx';
import ClientsPage from './pages/agency/ClientsPage.jsx';
import ClientDetailPage from './pages/agency/ClientDetailPage.jsx';
import TravelFilesPage from './pages/agency/TravelFilesPage.jsx';
import NewTravelFilePage from './pages/agency/NewTravelFilePage.jsx';
import TravelFileDetailPage from './pages/agency/TravelFileDetailPage.jsx';
import DocumentsPage from './pages/agency/DocumentsPage.jsx';
import VisasPage from './pages/agency/VisasPage.jsx';
import PaymentsPage from './pages/agency/PaymentsPage.jsx';
import NotificationsPage from './pages/agency/NotificationsPage.jsx';
import TeamPage from './pages/agency/TeamPage.jsx';
import SettingsPage from './pages/agency/SettingsPage.jsx';
import StudentVisasPage from './pages/agency/StudentVisasPage.jsx';

// Utilisation d'un Router résilient (HashRouter permet une navigation sans erreur 404 quel que soit l'hébergeur ou le mode fichier local)
const Router = typeof window !== 'undefined' && window.location.protocol === 'file:' 
  ? HashRouter 
  : BrowserRouter;

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* ================= 1. ROUTES PUBLIQUES ================= */}
            <Route element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="/tarifs" element={<PricingPage />} />
              <Route path="/fonctionnalites" element={<FeaturesPage />} />
            </Route>

            {/* ================= 2. ROUTES AUTHENTIFICATION ================= */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* ================= 3. ROUTES PRIVÉES ESPACE AGENCE ================= */}
            <Route path="/app" element={<AgencyLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="dossiers" element={<TravelFilesPage />} />
              <Route path="dossiers/new" element={<NewTravelFilePage />} />
              <Route path="dossiers/:id" element={<TravelFileDetailPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="visas" element={<VisasPage />} />
              <Route path="student-visas" element={<StudentVisasPage />} />
              <Route path="paiements" element={<PaymentsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="equipe" element={<TeamPage />} />
              <Route path="parametres" element={<SettingsPage />} />
            </Route>

            {/* Alias direct /student-visas */}
            <Route path="/student-visas" element={<Navigate to="/app/student-visas" replace />} />

            {/* Redirection globale vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}
