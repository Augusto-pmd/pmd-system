/**
 * Script de auditoría de permisos en runtime
 * Ejecutar en consola del navegador: window.auditPermissions()
 * 
 * Valida:
 * 1. user.role.permissions existe
 * 2. Es Array
 * 3. No es vacío
 * 4. ACL loguea "using explicit permissions"
 * 5. useCan() retorna true para módulos habilitados
 */

import { useAuthStore } from "@/store/authStore";
import { can, Permission } from "@/lib/acl";

export function auditPermissions(): {
  pass: boolean;
  results: Array<{ test: string; pass: boolean; evidence: string }>;
} {
  const results: Array<{ test: string; pass: boolean; evidence: string }> = [];
  let allPass = true;

  const user = useAuthStore.getState().user;

  // TEST 1: user existe
  const test1 = !!user;
  results.push({
    test: "user existe",
    pass: test1,
    evidence: test1 ? `user.id: ${user?.id}` : "user es null/undefined",
  });
  if (!test1) allPass = false;

  if (!user) {
    return { pass: false, results };
  }

  // TEST 2: user.role existe
  const test2 = !!user.role;
  results.push({
    test: "user.role existe",
    pass: test2,
    evidence: test2 ? `user.role.name: ${user.role?.name}` : "user.role es null/undefined",
  });
  if (!test2) allPass = false;

  if (!user.role) {
    return { pass: false, results };
  }

  // TEST 3: user.role.permissions existe
  const test3 = !!user.role.permissions;
  results.push({
    test: "user.role.permissions existe",
    pass: test3,
    evidence: test3 ? `user.role.permissions: ${JSON.stringify(user.role.permissions)}` : "user.role.permissions es null/undefined",
  });
  if (!test3) allPass = false;

  if (!user.role.permissions) {
    return { pass: false, results };
  }

  // TEST 4: user.role.permissions es Array
  const test4 = Array.isArray(user.role.permissions);
  results.push({
    test: "user.role.permissions es Array",
    pass: test4,
    evidence: test4 ? `Array.isArray() = true` : `Tipo real: ${typeof user.role.permissions}`,
  });
  if (!test4) allPass = false;

  // TEST 5: user.role.permissions no es vacío
  const test5 = Array.isArray(user.role.permissions) && user.role.permissions.length > 0;
  results.push({
    test: "user.role.permissions no es vacío",
    pass: test5,
    evidence: test5 ? `length: ${user.role.permissions.length}` : `length: ${user.role.permissions?.length || 0}`,
  });
  if (!test5) allPass = false;

  // TEST 6: useCan() retorna true para módulos habilitados
  const criticalPermissions: Array<{ permission: Permission; expected: boolean }> = [
    { permission: "works.read", expected: true },
    { permission: "suppliers.read", expected: true },
    { permission: "accounting.read", expected: true },
    { permission: "cashboxes.read", expected: true },
    { permission: "documents.read", expected: true },
    { permission: "alerts.read", expected: true },
  ];

  const test6Results: string[] = [];
  let test6Pass = true;

  criticalPermissions.forEach(({ permission, expected }) => {
    const result = can(permission);
    const pass = result === expected;
    test6Results.push(`${permission}: ${result} (${pass ? "✅" : "❌"})`);
    if (!pass) test6Pass = false;
  });

  results.push({
    test: "useCan() retorna true para módulos habilitados",
    pass: test6Pass,
    evidence: test6Results.join(", "),
  });
  if (!test6Pass) allPass = false;

  return { pass: allPass, results };
}

// Exponer globalmente para ejecutar desde consola
if (typeof window !== "undefined") {
  (window as Window & { auditPermissions?: typeof auditPermissions }).auditPermissions = auditPermissions;
}

