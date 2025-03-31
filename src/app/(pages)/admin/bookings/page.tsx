"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import AdminLayout from "../layout";
import { LoadingSpinner } from "./components";

// Use dynamic import with SSR disabled
const BookingsContent = dynamic(
  () => import('./components/bookings-content'),
  { ssr: false }
);

export default function BookingsPage() {
  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <BookingsContent />
      </Suspense>
    </AdminLayout>
  );
} 