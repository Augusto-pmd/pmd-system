
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

// This is the single source of truth for the database connection.
// It reads the DATABASE_URL environment variable and configures TypeORM.
// It is used by both the main application (app.module.ts) and the TypeORM CLI.
export function databaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set. Please provide a valid PostgreSQL connection string.');
  }

  // A single, unified configuration for all environments except testing.
  // SSL is enabled by default if the URL contains 'sslmode=require' or if in production.
  const isProduction = nodeEnv === 'production';
  const requiresSsl = isProduction || databaseUrl.includes('sslmode=require');

  return {
    type: 'postgres',
    url: databaseUrl,
    synchronize: false, // Never synchronize in production or development. Migrations are used.
    logging: nodeEnv === 'development', // Log queries only in development.
    autoLoadEntities: true,
    migrations: ['dist/migrations/*.js'], // Always point to compiled migrations.
    migrationsRun: false, // We will run migrations manually via a script in the Dockerfile.
    ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  };
}
