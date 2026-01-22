
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

// --- Corrected Import Paths ---
import { CsrfGuard } from './shared/guards/csrf.guard';
import { XssSanitizeInterceptor } from './shared/interceptors/xss-sanitize.interceptor';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from ../core/auth/auth.module';
import { UsersModule } from './core/users/users.module';
import { RolesModule } from './core/roles/roles.module';
import { AuditModule } from './core/audit/audit.module';

// --- Feature Modules (paths are correct for now) ---
import { SuppliersModule } from './suppliers/suppliers.module';
import { SupplierDocumentsModule } from './supplier-documents/supplier-documents.module';
import { WorksModule } from './works/works.module';
import { WorkBudgetsModule } from './work-budgets/work-budgets.module';
import { WorkDocumentsModule } from './work-documents/work-documents.module';
import { WorkUsersModule } from './work-users/work-users.module';
import { ContractsModule } from './contracts/contracts.module';
import { RubricsModule } from './rubrics/rubrics.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ValModule } from './val/val.module';
import { IncomesModule } from './incomes/incomes.module';
import { CashboxesModule } from './cashboxes/cashboxes.module';
import { CashMovementsModule } from './cash-movements/cash-movements.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AlertsModule } from './alerts/alerts.module';
import { AccountingModule } from './accounting/accounting.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { OfflineModule } from './offline/offline.module';
import { BackupModule } from './backup/backup.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TasksModule } from './tasks/tasks.module';
import { StorageModule } from './storage/storage.module';
import { AdminResetModule } from './admin-reset.module';
import { DebugModule } from './debug/debug.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...(process.env.NODE_ENV !== 'test' ? [NestScheduleModule.forRoot()] : []),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
    }]),
    
    // --- Application Modules ---
    SharedModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditModule,
    SuppliersModule,
    SupplierDocumentsModule,
    WorksModule,
    WorkBudgetsModule,
    WorkDocumentsModule,
    WorkUsersModule,
    ContractsModule,
    RubricsModule,
    ExpensesModule,
    ValModule,
    IncomesModule,
    CashboxesModule,
    CashMovementsModule,
    ScheduleModule,
    AlertsModule,
    AccountingModule,
    ExchangeRatesModule,
    OfflineModule,
    BackupModule,
    DashboardModule,
    TasksModule,
    StorageModule,
    AdminResetModule,
    ...(process.env.NODE_ENV !== 'production' ? [DebugModule] : []),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: XssSanitizeInterceptor,
    },
  ],
})
export class AppModule {}
