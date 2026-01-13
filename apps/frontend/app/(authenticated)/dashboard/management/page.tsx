"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function ManagementDashboard() {
  const { requireRole } = useAuth();

  useEffect(() => {
    requireRole(["admin"]);
  }, [requireRole]);

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Management Dashboard</h1>
          <p className="text-gray-600">Overview and analytics for direction</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Contracts</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Alerts</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Works</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <p className="text-gray-500 text-sm">No recent activity</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                View Reports
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Manage Contracts
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Review Alerts
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

