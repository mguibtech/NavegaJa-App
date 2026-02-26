import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {kycService} from '../kycService';
import {KycData} from '../kycTypes';

export function useKycStatus(enabled = true) {
  const query = useQuery<KycData, Error>({
    queryKey: queryKeys.kyc.status(),
    queryFn: () => kycService.getStatus(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    kyc: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
