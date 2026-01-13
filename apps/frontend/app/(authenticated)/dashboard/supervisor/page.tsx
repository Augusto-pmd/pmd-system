"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function SupervisorDashboard() {
  const { requireRole } = useAuth();

  useEffect(() => {
    requireRole(["operator"]);
  }, [requireRole]);

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Supervisor Dashboard</h1>
          <p className="text-gray-600">Work management and oversight</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Works</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Team Members</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Reviews</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Work Status</h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">No active works</p>
          </div>
        </div>
      </div>
  );
}

