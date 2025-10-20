import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

/**
 * A reusable custom hook for managing table sorting state and logic.
 * It supports a three-state sorting cycle: ascending -> descending -> unsorted.
 *
 * @param items The array of data to be sorted.
 * @param initialConfig An optional initial sort configuration.
 * @returns An object containing the sorted items, the function to request a sort, and the current sort configuration.
 */
export const useTableSort = <T extends Record<string, any>>(
  items: T[],
  initialConfig: SortConfig<T> | null = null
) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialConfig);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Handle null or undefined values by pushing them to the end
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        // Generic comparison for numbers, strings, and dates
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      // Case 1: New column clicked, start with 'asc'
      setSortConfig({ key, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      // Case 2: Same column, was 'asc', now 'desc'
      setSortConfig({ key, direction: 'desc' });
    } else {
      // Case 3: Same column, was 'desc', now unsorted (null)
      setSortConfig(null);
    }
  };

  return { sortedItems, requestSort, sortConfig };
};
