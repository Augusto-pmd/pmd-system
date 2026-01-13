"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function AdministrationDashboard() {
  const { requireRole } = useAuth();

  useEffect(() => {
    requireRole(["admin"]);
  }, [requireRole]);

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Administration Dashboard</h1>
          <p className="text-gray-600">Administrative tasks and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-mediumBlue">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Incomes</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">$0.00</p>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6 border-l-4 border-pmd-gold">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Suppliers</h3>
            <p className="text-2xl font-bold text-pmd-darkBlue">0</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Financial Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Income</span>
                <span className="font-semibold text-green-600">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Expenses</span>
                <span className="font-semibold text-red-600">$0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold text-pmd-darkBlue">Net Balance</span>
                <span className="font-bold text-pmd-darkBlue">$0.00</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-pmd p-6">
            <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Record Expense
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Record Income
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-pmd transition-colors">
                Manage Suppliers
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

