import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfig } from './config/database.config';

// Cargar variables de entorno desde .env
config();

const configService = new ConfigService();
const typeOrmConfig = databaseConfig(configService);

if (!typeOrmConfig) {
  throw new Error('Failed to generate TypeORM config for CLI. Ensure DATABASE_URL is set.');
}

export default new DataSource({
  ...typeOrmConfig,
  // FIX 1: path absoluto que funciona desde cualquier cwd
  entities: [__dirname + '/**/*.entity.ts'],
  // FIX 2: solo en dev local crea tablas automáticamente. En produccion (Render
  // u otro) siempre debe ser false para evitar que TypeORM sobreescriba el schema.
  synchronize: process.env.NODE_ENV !== 'production',
} as DataSourceOptions);
