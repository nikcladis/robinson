"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthModals from "./modals";

export default function AuthErrorHandler() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for auth error in URL
    const error = searchParams.get("error");
    if (error) {
      let message = "An error occurred during authentication";

      if (error === "CredentialsSignin") {
        message = "Invalid email or password";
      } else if (error === "AccessDenied") {
        message = "You do not have permission to access this resource";
      } else if (error === "Verification") {
        message = "The verification link is invalid or has expired";
      }

      setErrorMessage(message);
      setIsAuthModalOpen(true);

      // Remove the error from the URL (replace state)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  return (
    <AuthModals
      isOpen={isAuthModalOpen}
      onClose={() => {
        setIsAuthModalOpen(false);
        setErrorMessage("");
      }}
      initialError={errorMessage}
      initialMode="signin"
    />
  );
}
