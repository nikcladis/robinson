"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface BookingsLayoutProps {
  children: React.ReactNode;
}

export default function BookingsLayout({ children }: BookingsLayoutProps) {
  const { status } = useSession();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Show loading state while session is being checked
  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="text-center p-10">Loading...</div>
      </div>
    );
  }

  // Don't render anything if unauthenticated (redirect will happen in useEffect)
  if (status === "unauthenticated") {
    return null;
  }

  // Render the layout with children (page content)
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600 mt-2">
          View and manage your hotel reservations
        </p>
      </header>
      {children}
    </div>
  );
}
