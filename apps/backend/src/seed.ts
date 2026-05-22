import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { User } from './core/users/user.entity';
import { Role } from './core/roles/role.entity';
import { Organization } from './core/organizations/organization.entity';
import { UserRole } from './shared/enums/user-role.enum';
import dataSource from './data-source';

// Load environment variables
config();

async function seed() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  // Initialize DataSource
  const AppDataSource = dataSource;
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Conectado a la base de datos\n');

    // Ejecutar migraciones pendientes antes del seed
    console.log('🔄 Ejecutando migraciones pendientes...\n');
    const pendingMigrations = await AppDataSource.runMigrations();
    if (pendingMigrations.length > 0) {
      console.log(`✅ ${pendingMigrations.length} migración(es) ejecutada(s):`);
      pendingMigrations.forEach(migration => {
        console.log(`   - ${migration.name}`);
      });
      console.log('');
    } else {
      console.log('ℹ️  No hay migraciones pendientes\n');
    }

    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    const orgRepository = AppDataSource.getRepository(Organization);

    // 1. Crear Organización por defecto
    const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
    let defaultOrg = await orgRepository.findOne({ where: { id: DEFAULT_ORG_ID } });
    
    if (!defaultOrg) {
      defaultOrg = orgRepository.create({
        id: DEFAULT_ORG_ID,
        name: 'PMD Arquitectura',
        description: 'Organización por defecto PMD',
      });
      defaultOrg = await orgRepository.save(defaultOrg);
      console.log('✅ Organización creada: PMD Arquitectura');
    } else {
      console.log('ℹ️  Organización ya existe: PMD Arquitectura');
    }

    // 2. Crear todos los roles con permisos completos según PERMISSIONS_MAPPING.md
    const rolesToCreate = [
      {
        name: UserRole.DIRECTION,
        description: 'Rol de dirección con acceso completo al sistema y permisos de sobrescritura',
        permissions: {
          dashboard: ['read'],
          users: ['create', 'read', 'update', 'delete', 'manage'],
          roles: ['create', 'read', 'update', 'delete', 'manage'],
          works: ['create', 'read', 'update', 'delete', 'manage'],
          expenses: ['create', 'read', 'update', 'delete', 'validate', 'manage'],
          suppliers: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'manage'],
          contracts: ['create', 'read', 'update', 'delete', 'manage'],
          cashboxes: ['create', 'read', 'update', 'delete', 'close', 'approve', 'manage'],
          accounting: ['create', 'read', 'update', 'delete', 'close', 'reopen', 'manage'],
          incomes: ['create', 'read', 'update', 'delete', 'manage'],
          documents: ['create', 'read', 'update', 'delete', 'manage'],
          alerts: ['create', 'read', 'update', 'delete', 'manage'],
          audit: ['read', 'delete', 'manage'],
          reports: ['read'],
          settings: ['read', 'update', 'manage'],
          schedule: ['create', 'read', 'update', 'delete', 'manage'], // Control total sobre cronograma
        },
      },
      {
        name: UserRole.SUPERVISOR,
        description: 'Rol de supervisión de obras y gestión de cronogramas',
        permissions: {
          dashboard: ['read'],
          works: ['create', 'read', 'update'], // Puede crear obras y editar (solo campos menores)
          expenses: ['read'], // Solo lectura, no puede crear ni validar
          suppliers: ['read'], // Solo lectura
          contracts: ['read'], // Solo lectura
          cashboxes: ['read'], // Solo lectura, no puede cerrar
          incomes: ['read'], // Solo lectura
          documents: ['read'], // Solo lectura
          alerts: ['read'], // Solo lectura
          reports: ['read'], // Solo lectura
          schedule: ['read', 'update'], // Puede marcar etapas como completadas, no puede editar estructura
          // NO users, NO roles, NO accounting, NO audit, NO puede crear/validar expenses
        },
      },
      {
        name: UserRole.ADMINISTRATION,
        description: 'Rol de administración con permisos de validación y aprobación',
        permissions: {
          dashboard: ['read'],
          works: ['create', 'read'], // Puede crear obras y editar campos no críticos
          expenses: ['read', 'validate'], // Puede validar gastos
          suppliers: ['read', 'approve', 'reject'], // Puede aprobar/rechazar proveedores
          contracts: ['create', 'read', 'update'], // Puede crear y actualizar contratos
          cashboxes: ['read', 'approve'], // Puede aprobar diferencias de caja
          accounting: ['create', 'read', 'update', 'close'], // Puede cerrar meses, NO puede reopen
          incomes: ['read', 'create'], // Puede cargar ingresos según documento maestro
          documents: ['read', 'create', 'update'],
          alerts: ['read', 'create', 'update'],
          reports: ['read'],
          settings: ['read'],
          schedule: ['read'], // Solo consulta, no puede editar cronograma
          // NO users, NO roles, NO audit, NO puede reopen meses, NO puede override contratos bloqueados
        },
      },
      {
        name: UserRole.OPERATOR,
        description: 'Rol de operador con acceso limitado a recursos propios',
        permissions: {
          dashboard: ['read'],
          works: ['read'], // Solo lectura
          expenses: ['create', 'read'], // Puede crear y leer (solo propios)
          suppliers: ['create', 'read'], // Puede crear provisionales y leer
          cashboxes: ['create', 'read', 'close'], // Solo su propia caja
          documents: ['read', 'create'], // Puede crear documentos
          alerts: ['read'], // Solo lectura
          schedule: ['read'], // Solo consulta básica de cronogramas de obras asignadas
          // NO accounting, NO contracts, NO users, NO roles
        },
      },
    ];

    const createdRoles: { [key: string]: Role } = {};
    
    for (const roleData of rolesToCreate) {
      let role = await roleRepository.findOne({ 
        where: { name: roleData.name } 
      });
      
      if (!role) {
        role = roleRepository.create({
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
        });
        role = await roleRepository.save(role);
        console.log(`✅ Rol creado: ${roleData.name.toUpperCase()}`);
      } else {
        // Actualizar permisos y descripción si el rol ya existe
        // SIEMPRE actualizar permisos para asegurar que estén sincronizados con la configuración
        const currentPermsStr = JSON.stringify(role.permissions || {});
        const targetPermsStr = JSON.stringify(roleData.permissions || {});
        
        const needsUpdate = 
          role.description !== roleData.description ||
          currentPermsStr !== targetPermsStr;
        
        if (needsUpdate) {
          role.description = roleData.description;
          role.permissions = roleData.permissions; // Actualizar permisos según configuración
          role = await roleRepository.save(role);
          
          // Verificar específicamente para Supervisor que NO tenga users.read
          if (roleData.name === UserRole.SUPERVISOR) {
            const permsObj = role.permissions as Record<string, string[]>;
            const hasUsersRead = permsObj?.users?.includes('read') || false;
            if (hasUsersRead) {
              console.warn(`⚠️  ADVERTENCIA: Supervisor tiene 'users.read' en permisos - esto es incorrecto`);
            } else {
              console.log(`✅ Confirmado: Supervisor NO tiene 'users.read' en permisos`);
            }
          }
          
          // Verificar específicamente para Administration que NO tenga users.read ni audit.read
          if (roleData.name === UserRole.ADMINISTRATION) {
            const permsObj = role.permissions as Record<string, string[]>;
            const hasUsersRead = permsObj?.users?.includes('read') || false;
            const hasAuditRead = permsObj?.audit?.includes('read') || false;
            if (hasUsersRead) {
              console.warn(`⚠️  ADVERTENCIA: Administration tiene 'users.read' en permisos - esto es incorrecto`);
              // Eliminar permisos incorrectos
              delete permsObj.users;
              role.permissions = permsObj;
              role = await roleRepository.save(role);
              console.log(`🔧 Corregido: Se eliminaron permisos 'users' de Administration`);
            }
            if (hasAuditRead) {
              console.warn(`⚠️  ADVERTENCIA: Administration tiene 'audit.read' en permisos - esto es incorrecto`);
              // Eliminar permisos incorrectos
              delete permsObj.audit;
              role.permissions = permsObj;
              role = await roleRepository.save(role);
              console.log(`🔧 Corregido: Se eliminaron permisos 'audit' de Administration`);
            }
            if (!hasUsersRead && !hasAuditRead) {
              console.log(`✅ Confirmado: Administration NO tiene 'users.read' ni 'audit.read' en permisos`);
            }
          }
          
          console.log(`🔄 Rol actualizado: ${roleData.name.toUpperCase()} (permisos y descripción sincronizados)`);
        } else {
          // Aunque no se detecte diferencia, verificar y corregir permisos incorrectos para Administration
          if (roleData.name === UserRole.ADMINISTRATION) {
            const permsObj = role.permissions as Record<string, string[]>;
            const hasUsersRead = permsObj?.users?.includes('read') || false;
            const hasAuditRead = permsObj?.audit?.includes('read') || false;
            if (hasUsersRead || hasAuditRead) {
              console.warn(`⚠️  ADVERTENCIA: Administration tiene permisos incorrectos aunque JSON parece igual`);
              if (hasUsersRead) {
                delete permsObj.users;
                console.log(`🔧 Eliminando permisos 'users' de Administration`);
              }
              if (hasAuditRead) {
                delete permsObj.audit;
                console.log(`🔧 Eliminando permisos 'audit' de Administration`);
              }
              role.permissions = permsObj;
              role = await roleRepository.save(role);
              console.log(`🔄 Rol actualizado: ${roleData.name.toUpperCase()} (permisos incorrectos eliminados)`);
            } else {
              console.log(`ℹ️  Rol ya existe: ${roleData.name.toUpperCase()} (permisos ya están actualizados)`);
            }
          } else {
            console.log(`ℹ️  Rol ya existe: ${roleData.name.toUpperCase()} (permisos ya están actualizados)`);
          }
        }
      }
      
      createdRoles[roleData.name] = role;
    }

    // 3. Crear usuarios de prueba para cada rol (para tests E2E)
    // NOTA: admin@pmd.com se creará con rol ADMINISTRATION para los tests E2E
    const testUsers = [
      {
        email: 'direction@pmd.com',
        password: 'password123',
        fullName: 'Usuario Direction',
        role: UserRole.DIRECTION,
      },
      {
        email: 'supervisor@pmd.com',
        password: 'password123',
        fullName: 'Usuario Supervisor',
        role: UserRole.SUPERVISOR,
      },
      {
        email: 'admin@pmd.com', // Este usuario se usará para tests E2E con rol ADMINISTRATION
        password: 'password123',
        fullName: 'Usuario Administration',
        role: UserRole.ADMINISTRATION,
        updateExisting: true, // Flag para actualizar el usuario existente (si existe con otro rol)
      },
      {
        email: 'operator@pmd.com',
        password: 'password123',
        fullName: 'Usuario Operator',
        role: UserRole.OPERATOR,
      },
    ];

    console.log('\n👥 Creando usuarios de prueba...');
    for (const testUserData of testUsers) {
      const testUserRole = createdRoles[testUserData.role];
      if (!testUserRole) {
        console.warn(`⚠️  Rol ${testUserData.role} no encontrado, saltando usuario ${testUserData.email}`);
        continue;
      }

      let testUser = await userRepository.findOne({
        where: { email: testUserData.email },
        relations: ['role'],
      });

      if (!testUser) {
        const hashedPassword = await bcrypt.hash(testUserData.password, 10);
        testUser = userRepository.create({
          email: testUserData.email,
          password: hashedPassword,
          fullName: testUserData.fullName,
          role: testUserRole,
          organization: defaultOrg,
          isActive: true,
        });
        testUser = await userRepository.save(testUser);
        console.log(`✅ Usuario de prueba creado: ${testUserData.email} (${testUserData.role})`);
      } else {
        // Actualizar si el rol es diferente o si falta información
        let updated = false;
        
        // Si tiene el flag updateExisting o el rol es diferente, actualizar el rol
        // IMPORTANTE: Si updateExisting es true, SIEMPRE actualizar el rol aunque sea diferente
        const oldRoleName = testUser.role?.name?.toLowerCase() || 'sin rol';
        const newRoleName = testUserData.role.toLowerCase();
        const hasUpdateExistingFlag = (testUserData as any).updateExisting === true;
        const shouldUpdateRole = hasUpdateExistingFlag || !testUser.role || oldRoleName !== newRoleName;
        
        if (shouldUpdateRole) {
          const oldRole = testUser.role?.name || 'sin rol';
          testUser.role = testUserRole;
          updated = true;
          if (hasUpdateExistingFlag) {
            console.log(`🔄 Forzando actualización de rol para ${testUserData.email} de ${oldRole} a ${testUserData.role} (updateExisting=true)`);
          } else {
            console.log(`🔄 Actualizando rol de ${testUserData.email} de ${oldRole} a ${testUserData.role}`);
          }
        }
        
        if (!testUser.organization) {
          testUser.organization = defaultOrg;
          updated = true;
        }
        
        if (!testUser.isActive) {
          testUser.isActive = true;
          updated = true;
        }

        // Actualizar contraseña si tiene el flag updateExisting (para tests, usar password123)
        if ((testUserData as any).updateExisting) {
          testUser.password = await bcrypt.hash(testUserData.password, 10);
          updated = true;
        }

        if (updated) {
          await userRepository.save(testUser);
          console.log(`🔧 Usuario de prueba actualizado: ${testUserData.email} (${testUserData.role})`);
        } else {
          console.log(`ℹ️  Usuario de prueba ya existe: ${testUserData.email} (rol actual: ${testUser.role?.name})`);
        }
      }
    }

    console.log('\n📋 Credenciales de usuarios:');
    console.log(`   Direction: direction@pmd.com / password123`);
    console.log(`   Supervisor: supervisor@pmd.com / password123`);
    console.log(`   Administration: admin@pmd.com / password123`);
    console.log(`   Operator: operator@pmd.com / password123`);
    console.log('\n✅ Seed completado exitosamente!\n');

  } catch (error) {
    // Los errores en seed siempre se muestran ya que es un script de inicialización
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexión a la base de datos cerrada');
    }
  }
}

// Exportar la función seed para uso programático
export { seed };

// Ejecutar seed solo si se llama directamente (no cuando se importa)
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✨ Proceso de seed finalizado');
      process.exit(0);
    })
    .catch((error) => {
      // Los errores fatales en seed siempre se muestran ya que es un script de inicialización
      console.error('💥 Error fatal en seed:', error);
      process.exit(1);
    });
}

