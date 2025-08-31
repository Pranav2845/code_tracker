// src/Routes.jsx
import React from "react";
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

import Dashboard from "./pages/dashboard";
import PlatformConnection from "./pages/platform-connection";
import Onboarding from "./pages/onboarding";
import TopicAnalysis from "./pages/topic-analysis";
import Contests from "./pages/contests";
import GeminiPage from "./pages/gemini";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import { SignIn, SignUp } from "@clerk/clerk-react";

const Routes = () => (
  <ErrorBoundary>
    <ScrollToTop />
    <RouterRoutes>
      {/* Clerk auth pages */}
      <Route
        path="/sign-in"
        element={<SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard" />}
      />
      <Route
        path="/sign-up"
        element={<SignUp routing="path" path="/sign-up" afterSignUpUrl="/dashboard" />}
      />

      {/* Back-compat: redirect old auth routes */}
      <Route path="/login" element={<Navigate to="/sign-in" replace />} />
      <Route path="/register" element={<Navigate to="/sign-up" replace />} />

      {/* Protected pages */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/platform-connection"
        element={
          <ProtectedRoute>
            <PlatformConnection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topic-analysis"
        element={
          <ProtectedRoute>
            <TopicAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contests"
        element={
          <ProtectedRoute>
            <Contests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gemini"
        element={
          <ProtectedRoute>
            <GeminiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  </ErrorBoundary>
);

export default Routes;
