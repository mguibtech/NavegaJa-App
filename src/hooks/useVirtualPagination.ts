import {useState, useEffect} from 'react';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Client-side virtual pagination — loads all data at once but renders
 * items progressively as the user scrolls, like an infinite list.
 *
 * Use when the API does not support server-side pagination.
 * Exposes `visibleItems`, `loadMore`, `hasMore`, and `isLoadingMore`.
 */
export function useVirtualPagination<T>(
  data: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Reset when the source data changes (e.g., tab filter switch)
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [data.length, pageSize]);

  const visibleItems = data.slice(0, visibleCount);
  const hasMore = visibleCount < data.length;

  function loadMore() {
    if (hasMore) {
      setVisibleCount(c => Math.min(c + pageSize, data.length));
    }
  }

  return {visibleItems, hasMore, loadMore};
}
