import {useInfiniteQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {gamificationService} from '../../gamificationService';
import {GamificationTransaction} from '../../gamificationTypes';

const PAGE_SIZE = 20;

export function useGamificationHistory() {
  const query = useInfiniteQuery<GamificationTransaction[], Error>({
    queryKey: queryKeys.gamification.history(),
    queryFn: ({pageParam}) => gamificationService.getHistory(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      (lastPage as GamificationTransaction[]).length === PAGE_SIZE
        ? (lastPageParam as number) + 1
        : undefined,
  });

  const history = query.data?.pages.flat() ?? [];

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
