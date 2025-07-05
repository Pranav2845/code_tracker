// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/ui/PrivateRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/profile";
import Settings from "./pages/settings"; 

import Dashboard from "./pages/dashboard";
import PlatformConnection from "./pages/platform-connection";
import Onboarding from "./pages/onboarding";
import TopicAnalysis from "./pages/topic-analysis";
import Contests from "./pages/contests";
import NotFound from "./pages/NotFound";

const Routes = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* If someone hits “/” with no token, PrivateRoute will redirect to /login */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/platform-connection"
          element={
            <PrivateRoute>
              <PlatformConnection />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />
        <Route
          path="/topic-analysis"
          element={
            <PrivateRoute>
              <TopicAnalysis />
            </PrivateRoute>
          }
       />
        <Route
          path="/contests"
          element={
            <PrivateRoute>
              <Contests />
            </PrivateRoute>
          }
        />
         <Route
         path="/profile"
         element={
           <PrivateRoute>
             <Profile />
           </PrivateRoute>
         }
       />
       <Route
         path="/settings"
         element={
           <PrivateRoute>
             <Settings />
           </PrivateRoute>
         }
       />


        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </ErrorBoundary>
  </BrowserRouter>
);

export default Routes;
