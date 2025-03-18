"use client";

import { useState } from "react";
import SignInModal from "./sign-in";
import SignUpModal from "./sign-up";

type AuthModalMode = "signin" | "signup" | null;

interface AuthModalsProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  initialError?: string;
  onClose: () => void;
}

export default function AuthModals({
  isOpen,
  initialMode = "signin",
  initialError = "",
  onClose,
}: AuthModalsProps) {
  const [mode, setMode] = useState<AuthModalMode>(isOpen ? initialMode : null);

  // When isOpen changes, update the mode accordingly
  if (!isOpen && mode !== null) {
    setMode(null);
  } else if (isOpen && mode === null) {
    setMode(initialMode);
  }

  const handleClose = () => {
    onClose();
    // Keep the last mode in state to avoid UI flicker during close animation
    // Will be reset next time the modal opens
  };

  const switchToSignIn = () => setMode("signin");
  const switchToSignUp = () => setMode("signup");

  return (
    <>
      <SignInModal
        isOpen={isOpen && mode === "signin"}
        onClose={handleClose}
        initialError={initialError}
        onSwitchToSignUp={switchToSignUp}
      />
      <SignUpModal
        isOpen={isOpen && mode === "signup"}
        onClose={handleClose}
        onSwitchToSignIn={switchToSignIn}
      />
    </>
  );
}
