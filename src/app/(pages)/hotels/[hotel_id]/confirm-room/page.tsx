"use client";

import { Suspense } from "react";
import BookingForm from "./booking-form";

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
