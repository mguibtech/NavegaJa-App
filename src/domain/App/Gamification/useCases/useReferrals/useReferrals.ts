import {useQuery} from '@tanstack/react-query';
import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';
import {queryKeys} from '@infra';

export interface ReferralEntry {
  id: string;
  referredName: string;
  status: 'pending' | 'converted';
  createdAt: string;
  convertedAt?: string;
}

export interface ReferralsData {
  referralCode: string;
  totalReferred: number;
  totalConverted: number;
  pendingConversion: number;
  referrals: ReferralEntry[];
}

export function useReferrals() {
  const query = useQuery<ReferralsData, Error>({
    queryKey: queryKeys.referrals.my(),
    queryFn: () => api.get<ReferralsData>(API_ENDPOINTS.GAMIFICATION_REFERRALS),
    staleTime: 5 * 60 * 1000,
  });

  return {
    referralsData: query.data
      ? {...query.data, referrals: query.data.referrals ?? []}
      : null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
