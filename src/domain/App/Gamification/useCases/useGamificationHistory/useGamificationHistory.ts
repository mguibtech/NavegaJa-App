import {useInfiniteQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {gamificationService} from '../../gamificationService';
import {PaginatedGamificationHistory} from '../../gamificationTypes';

const PAGE_SIZE = 20;

export function useGamificationHistory() {
  const query = useInfiniteQuery<PaginatedGamificationHistory, Error>({
    queryKey: queryKeys.gamification.history(),
    queryFn: ({pageParam}) => gamificationService.getHistory(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.page < lastPage.lastPage
        ? lastPage.page + 1
        : undefined,
  });

  const history = query.data?.pages.flatMap(page => page.data) ?? [];

  return {
    history,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error,
    hasMore: query.hasNextPage,
    fetchHistory: query.refetch,
    fetchMoreHistory: query.fetchNextPage,
  };
}
