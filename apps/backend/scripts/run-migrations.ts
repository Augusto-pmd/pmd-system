import dataSource from '../src/data-source';

const runMigrations = async () => {
  try {
    console.log('🔵 Initializing data source for migration...');
    await dataSource.initialize();
    console.log('🟢 Data source initialized. Running migrations...');
    await dataSource.runMigrations();
    console.log('🟢 Migrations executed successfully.');
    await dataSource.destroy();
    console.log('🔵 Data source destroyed. Migration process finished.');
    process.exit(0);
  } catch (err) {
    console.error('🔴 Error during migration process:', err);
    process.exit(1);
  }
};

runMigrations();
