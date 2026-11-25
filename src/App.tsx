/**
 * App.tsx
 * --------
 * Root component — sets up all application routes.
 *
 *   /, /login, /register      → public
 *   /dashboard … /settings    → protected (AuthGuard + MainLayout)
 *
 * Pages are lazy-loaded so the first visit only downloads what it needs.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { isLoggedIn } from './utils/auth';

const DashboardPage       = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage    = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const BudgetsPage         = lazy(() => import('./pages/BudgetsPage').then(m => ({ default: m.BudgetsPage })));
const InsightsPage        = lazy(() => import('./pages/InsightsPage').then(m => ({ default: m.InsightsPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(m => ({ default: m.RecommendationsPage })));
const GoalsPage           = lazy(() => import('./pages/GoalsPage').then(m => ({ default: m.GoalsPage })));
const SettingsPage        = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

/** Redirects to /login when there's no valid (unexpired) token. */
const AuthGuard = ({ children }: { children: React.ReactNode }) =>
  isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;

/** Signed-in users don't need to see the login/register screens again. */
const GuestOnly = ({ children }: { children: React.ReactNode }) =>
  isLoggedIn() ? <Navigate to="/dashboard" replace /> : <>{children}</>;

const PageLoader = () => (
  <div className="py-24 text-center">
    <p className="hand text-2xl text-slate-400 animate-pulse">flipping pages…</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

        <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
          <Route path="/dashboard"       element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
          <Route path="/transactions"    element={<Suspense fallback={<PageLoader />}><TransactionsPage /></Suspense>} />
          <Route path="/budgets"         element={<Suspense fallback={<PageLoader />}><BudgetsPage /></Suspense>} />
          <Route path="/insights"        element={<Suspense fallback={<PageLoader />}><InsightsPage /></Suspense>} />
          <Route path="/recommendations" element={<Suspense fallback={<PageLoader />}><RecommendationsPage /></Suspense>} />
          <Route path="/goals"           element={<Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>} />
          <Route path="/settings"        element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

/** A friendly 404 instead of silently bouncing to the home page. */
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center p-6 text-center">
    <div>
      <p className="font-display text-7xl font-semibold text-slate-900">404</p>
      <p className="hand text-2xl text-clay-500 mt-2 -rotate-1">this page wandered off, like ₹500 from a wallet</p>
      <a href="/" className="inline-block mt-6 bg-slate-900 text-slate-50 px-5 py-2.5 rounded-full font-medium hover:bg-emerald-700 transition-colors">
        Take me home
      </a>
    </div>
  </div>
);

export default App;
