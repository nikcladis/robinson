"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../layout";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setIsLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user role: ${response.statusText}`);
      }
      
      // Update user role in the state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as "CUSTOMER" | "ADMIN" } : user
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }
      
      // Remove the deleted user from the state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const filteredUsers = activeFilter === "all" 
    ? users 
    : users.filter(user => user.role === activeFilter);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md text-red-600 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveFilter("CUSTOMER")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "CUSTOMER"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Regular Users
            </button>
            <button
              onClick={() => setActiveFilter("ADMIN")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === "ADMIN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Admins
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center p-10 bg-gray-50 rounded-md">
            <p className="text-gray-600">No users found matching your filter.</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {user.role === "CUSTOMER" ? (
                        <button
                          onClick={() => handleRoleChange(user.id, "ADMIN")}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Make Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(user.id, "CUSTOMER")}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                        >
                          Remove Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 