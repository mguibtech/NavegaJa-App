import {useQuery} from '@tanstack/react-query';
import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';
import {queryKeys} from '@infra';

export interface ReferralEntry {
  id: string;
  referredName: string;
  referredAvatarUrl?: string | null;
  status: 'pending' | 'converted';
  createdAt: string;
  convertedAt?: string;
}

interface ReferralsApiResponse {
  referralCode: string | null;
  totalReferred: number;
  totalConverted: number;
  pendingConversions: number;
  list: ReferralEntry[];
}

export interface ReferralsData {
  referralCode: string;
  totalReferred: number;
  totalConverted: number;
  pendingConversion: number;
  referrals: ReferralEntry[];
}

export function useReferrals() {
  const query = useQuery<ReferralsApiResponse, Error>({
    queryKey: queryKeys.referrals.my(),
    queryFn: () =>
      api.get<ReferralsApiResponse>(API_ENDPOINTS.GAMIFICATION_REFERRALS),
    staleTime: 5 * 60 * 1000,
  });

  return {
    referralsData: query.data
      ? {
          referralCode: query.data.referralCode ?? '',
          totalReferred: query.data.totalReferred ?? 0,
          totalConverted: query.data.totalConverted ?? 0,
          pendingConversion: query.data.pendingConversions ?? 0,
          referrals: query.data.list ?? [],
        }
      : null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
