
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from './config/database.config';

// Load environment variables from .env file for the CLI.
config();

// The TypeORM CLI needs a single, exported DataSource instance.
// We use our unified 'databaseConfig' function to create it.
// This ensures that the CLI and the application use the exact same
// connection settings, derived consistently from DATABASE_URL.

const configService = new ConfigService();
const typeOrmConfig = databaseConfig(configService);

if (!typeOrmConfig) {
  throw new Error('Failed to generate TypeORM config for CLI. Ensure DATABASE_URL is set.');
}

export default new DataSource({
  ...typeOrmConfig,
  // CLI needs to know where to find entities, which might not be loaded automatically.
  // Pointing to the source ensures it can find them before compilation.
  entities: ['apps/backend/src/**/*.entity.ts'],
} as DataSourceOptions);
