import { MutatorOptions } from "swr";

/**
 * Helper function to refresh related data after critical operations
 * This ensures all affected modules are updated
 */
export async function refreshRelatedData(
  globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>,
  options: {
    expenses?: boolean;
    contracts?: boolean;
    works?: boolean;
    accounting?: boolean;
    alerts?: boolean;
    dashboard?: boolean;
    cashboxes?: boolean;
    incomes?: boolean;
    suppliers?: boolean;
  } = {}
) {
  const {
    expenses = false,
    contracts = false,
    works = false,
    accounting = false,
    alerts = false,
    dashboard = false,
    cashboxes = false,
    incomes = false,
    suppliers = false,
  } = options;

  const refreshPromises: Promise<any>[] = [];

  if (expenses) {
    refreshPromises.push(globalMutate("/expenses"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/expenses')));
  }

  if (contracts) {
    refreshPromises.push(globalMutate("/contracts"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/contracts')));
  }

  if (works) {
    refreshPromises.push(globalMutate("/works"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/works')));
  }

  if (accounting) {
    refreshPromises.push(globalMutate("/accounting"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/accounting')));
  }

  if (alerts) {
    refreshPromises.push(globalMutate("/alerts"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/alerts')));
  }

  if (dashboard) {
    refreshPromises.push(globalMutate("/dashboard"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/dashboard')));
  }

  if (cashboxes) {
    refreshPromises.push(globalMutate("/cashboxes"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/cashbox')));
  }

  if (incomes) {
    refreshPromises.push(globalMutate("/incomes"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/incomes')));
  }

  if (suppliers) {
    refreshPromises.push(globalMutate("/suppliers"));
    refreshPromises.push(globalMutate((key: any) => typeof key === 'string' && key.startsWith('/suppliers')));
  }

  // Execute all refreshes in parallel
  await Promise.allSettled(refreshPromises);
}

/**
 * Common refresh patterns for specific operations
 */
export const refreshPatterns = {
  /**
   * Refresh data after expense validation
   */
  afterExpenseValidation: async (
    globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>
  ) => {
    await refreshRelatedData(globalMutate, {
      expenses: true,
      contracts: true,
      works: true,
      accounting: true,
      alerts: true,
      dashboard: true,
    });
  },

  /**
   * Refresh data after cashbox closure
   */
  afterCashboxClosure: async (
    globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>
  ) => {
    await refreshRelatedData(globalMutate, {
      cashboxes: true,
      alerts: true,
      dashboard: true,
      accounting: true,
    });
  },

  /**
   * Refresh data after contract update
   */
  afterContractUpdate: async (
    globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>
  ) => {
    await refreshRelatedData(globalMutate, {
      contracts: true,
      works: true,
      alerts: true,
      dashboard: true,
    });
  },

  /**
   * Refresh data after work update
   */
  afterWorkUpdate: async (
    globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>
  ) => {
    await refreshRelatedData(globalMutate, {
      works: true,
      expenses: true,
      contracts: true,
      dashboard: true,
    });
  },

  /**
   * Refresh data after income creation/update
   */
  afterIncomeUpdate: async (
    globalMutate: (key?: any, data?: any, opts?: MutatorOptions) => Promise<any>
  ) => {
    await refreshRelatedData(globalMutate, {
      incomes: true,
      works: true,
      accounting: true,
      dashboard: true,
    });
  },
};

