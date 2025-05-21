import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./pages/dashboard";
import PlatformConnection from "./pages/platform-connection";
import Onboarding from "./pages/onboarding";
import TopicAnalysis from "./pages/topic-analysis";
import NotFound from "./pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/platform-connection" element={<PlatformConnection />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/topic-analysis" element={<TopicAnalysis />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;