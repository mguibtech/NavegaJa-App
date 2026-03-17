import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {kycService} from '../kycService';
import {DocumentChangeRequest} from '../kycTypes';

export function useDocumentChangeRequests(enabled = true) {
  const query = useQuery<DocumentChangeRequest[], Error>({
    queryKey: queryKeys.kyc.documentChangeRequests(),
    queryFn: () => kycService.getDocumentChangeRequests(),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
