import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = sessionStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // redirect to /login, but save current location so we can come back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
