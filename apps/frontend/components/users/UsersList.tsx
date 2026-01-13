"use client";

import { UserCard } from "./UserCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { User } from "@/lib/types/user";

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

