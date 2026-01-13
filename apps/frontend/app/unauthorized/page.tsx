"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pmd-darkBlue to-pmd-mediumBlue">
      <div className="bg-white rounded-lg shadow-pmd p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Unauthorized Access</h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page. Please contact your administrator if you
            believe this is an error.
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button variant="primary" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

