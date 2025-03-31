"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Use dynamic import with SSR disabled
const DynamicHotelList = dynamic(
  () => import("@/app/(pages)/hotels/hotel-list"),
  { ssr: false }
);

const DynamicSignInModal = dynamic(
  () => import("@/shared/auth/modals/sign-in"),
  { ssr: false }
);

export default function Home() {
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        {/* Featured Hotels Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Hotels</h2>
            <Link
              href="/hotels"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Hotels →
            </Link>
          </div>
          <Suspense fallback={
            <div className="h-60 flex justify-center items-center">
              <p>Loading hotels...</p>
            </div>
          }>
            <DynamicHotelList featuredLimit={3} />
          </Suspense>
        </div>

        {/* About Robinson Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Why Choose Robinson Hotels?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Premier Locations</h3>
              <p className="text-gray-600">
                Our hotels are located in prime destinations, offering
                convenient access to local attractions and business centers.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Exceptional Service</h3>
              <p className="text-gray-600">
                Experience our signature hospitality with attentive staff
                dedicated to making your stay memorable.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Comfort & Luxury</h3>
              <p className="text-gray-600">
                Enjoy premium amenities and comfortable accommodations
                designed for both business and leisure travelers.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-50 p-8 rounded-xl shadow-sm text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Robinson?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied guests who choose Robinson Hotels for
            unforgettable stays at competitive rates.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/hotels"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Hotels
            </Link>
            <button
              onClick={() => setIsSignInModalOpen(true)}
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition-colors"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <DynamicSignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={() => {}}
      />
    </>
  );
}
