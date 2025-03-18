"use client";

import { useRouter } from "next/navigation";
import { DashboardCard } from "./dashboard-card";
import AdminLayout from "./layout";

const DASHBOARD_ITEMS = [
  {
    title: "Hotel Management",
    description: "Add, edit, or remove hotels from your system",
    buttonText: "Manage Hotels",
    path: "/admin/hotels",
  },
  {
    title: "Room Management",
    description: "Configure rooms, pricing, and availability",
    buttonText: "Manage Rooms",
    path: "/admin/rooms",
  },
  {
    title: "Booking Management",
    description: "View and manage customer bookings",
    buttonText: "Manage Bookings",
    path: "/admin/bookings",
  },
  {
    title: "User Management",
    description: "Manage customer and admin accounts",
    buttonText: "Manage Users",
    path: "/admin/users",
  },
  {
    title: "Reports",
    description: "View booking and revenue reports",
    buttonText: "View Reports",
    path: "/admin/reports",
  },
  {
    title: "System Settings",
    description: "Configure system preferences and settings",
    buttonText: "System Settings",
    path: "/admin/settings",
  },
] as const;

export default function AdminPage() {
  const router = useRouter();

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <header className="mb-10 text-center bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your hotel system</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DASHBOARD_ITEMS.map((item) => (
            <DashboardCard
              key={item.path}
              title={item.title}
              description={item.description}
              buttonText={item.buttonText}
              onClick={() => router.push(item.path)}
            />
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
