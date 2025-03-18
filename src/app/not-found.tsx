"use client";

import Link from "next/link";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";

export default function NotFound() {
  return (
    <SessionProvider>
      <div className="flex flex-col pb-10">
        <main className="flex-1 bg-gray-50">
          <div className="flex flex-col items-center justify-center p-4 h-full">
            <div className="text-center space-y-6 max-w-md">
              {/* 404 Illustration */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <Image
                  src="/images/404.svg"
                  alt="404 Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="text-4xl font-bold text-gray-900">
                Page Not Found
              </h1>
              <p className="text-lg text-gray-600">
                Oops! It seems like you&apos;ve ventured into uncharted
                territory. The page you&apos;re looking for doesn&apos;t exist.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Return Home
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </div>

              {/* Additional Help */}
              <div className="mt-12 border-t pt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Need Help?
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-600">
                  <Link
                    href="/hotels"
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Browse Hotels
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
