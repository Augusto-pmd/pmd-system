"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecentActivitySection() {
  // Placeholder por ahora - se puede conectar con audit logs en el futuro
  const activities: any[] = [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No hay actividad reciente"
            description="Tu actividad reciente aparecerá aquí"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-pmd">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

