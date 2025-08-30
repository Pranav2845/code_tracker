// src/routes/ProtectedRoute.jsx
import React from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export default function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={window.location.pathname + window.location.search} />
      </SignedOut>
    </>
  );
}
