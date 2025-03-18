"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthModals from "../auth/modals";
import SignOutModal from "../auth/modals/sign-out";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link
                  href="/"
                  className="text-2xl font-bold text-white hover:text-gray-200 transition-colors"
                >
                  HotelBooker
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/hotels"
                  className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                >
                  Hotels
                </Link>
                {session?.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-300 hover:text-white hover:border-gray-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {status === "loading" ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">
                    Welcome, {session.user.name}
                  </span>
                  <Link
                    href="/bookings"
                    className="rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => setIsSignOutModalOpen(true)}
                    className="rounded-md bg-red-900/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-gray-900" id="mobile-menu">
            <div className="space-y-1 pt-2 pb-3">
              <Link
                href="/"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/hotels"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hotels
              </Link>
              {session?.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-300 hover:border-gray-700 hover:bg-gray-800 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              {status === "loading" ? (
                <div className="px-4 text-sm text-gray-400">Loading...</div>
              ) : session ? (
                <div>
                  <div className="px-4 py-2">
                    <div className="text-base font-medium text-white">
                      {session.user.name}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {session.user.email}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsSignOutModalOpen(true);
                      }}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-blue-400 hover:bg-gray-800 hover:text-blue-300 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <AuthModals
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="signin"
      />
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
      />
    </>
  );
}
