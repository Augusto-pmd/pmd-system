/**
 * Utility functions for comparing and displaying differences between objects
 */

export interface DiffResult {
  added: Record<string, any>;
  removed: Record<string, any>;
  changed: Record<string, { old: any; new: any }>;
  unchanged: Record<string, any>;
}

/**
 * Compare two objects and return differences
 */
export function compareObjects(prev: any, next: any): DiffResult {
  const result: DiffResult = {
    added: {},
    removed: {},
    changed: {},
    unchanged: {},
  };

  if (!prev && !next) return result;
  if (!prev) {
    result.added = next || {};
    return result;
  }
  if (!next) {
    result.removed = prev;
    return result;
  }

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  for (const key of allKeys) {
    const prevValue = prev[key];
    const nextValue = next[key];

    if (!(key in prev)) {
      // Key was added
      result.added[key] = nextValue;
    } else if (!(key in next)) {
      // Key was removed
      result.removed[key] = prevValue;
    } else if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
      // Value changed
      result.changed[key] = { old: prevValue, new: nextValue };
    } else {
      // Value unchanged
      result.unchanged[key] = prevValue;
    }
  }

  return result;
}

/**
 * Format value for display
 */
export function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

