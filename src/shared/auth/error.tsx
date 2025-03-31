"use client";

import { Suspense } from "react";
import AuthErrorContent from "./error-content";

export default function AuthErrorHandler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
