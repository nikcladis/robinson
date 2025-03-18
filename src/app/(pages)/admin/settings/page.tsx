"use client";

import { useState } from "react";
import AdminLayout from "../layout";

interface SettingsData {
  siteTitle: string;
  contactEmail: string;
  currencySymbol: string;
  maxBookingDays: number;
  enableUserRegistration: boolean;
  enableReviews: boolean;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsData>({
    siteTitle: "Hotel Reservation System",
    contactEmail: "contact@hotelreservation.com",
    currencySymbol: "$",
    maxBookingDays: 30,
    enableUserRegistration: true,
    enableReviews: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // This is a placeholder - in a real application, this would save to your backend
      // const response = await fetch("/api/admin/settings", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // if (!response.ok) {
      //   throw new Error("Failed to save settings");
      // }
      
      // Simulate successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Settings saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system preferences and settings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-md text-green-600 mb-6">
            {success}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">General Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Title
                    </label>
                    <input
                      type="text"
                      id="siteTitle"
                      name="siteTitle"
                      value={formData.siteTitle}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Booking Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 mb-1">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      id="currencySymbol"
                      name="currencySymbol"
                      value={formData.currencySymbol}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxBookingDays" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Booking Days
                    </label>
                    <input
                      type="number"
                      id="maxBookingDays"
                      name="maxBookingDays"
                      value={formData.maxBookingDays}
                      onChange={handleChange}
                      min={1}
                      max={365}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-4">Feature Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableUserRegistration"
                      name="enableUserRegistration"
                      checked={formData.enableUserRegistration}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableUserRegistration" className="ml-2 block text-sm text-gray-900">
                      Enable User Registration
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableReviews"
                      name="enableReviews"
                      checked={formData.enableReviews}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enableReviews" className="ml-2 block text-sm text-gray-900">
                      Enable Hotel Reviews
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 