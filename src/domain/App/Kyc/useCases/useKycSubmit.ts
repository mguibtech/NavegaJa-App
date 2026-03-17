import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';
import {kycService} from '../kycService';
import {KycSubmitData} from '../kycTypes';

export function useKycSubmit() {
  const queryClient = useQueryClient();

  const mutation = useMutation<{message: string; kycStatus: string}, Error, KycSubmitData>({
    mutationFn: (data: KycSubmitData) => kycService.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
      queryClient.invalidateQueries({
        queryKey: queryKeys.kyc.documentChangeRequests(),
      });
    },
  });

  return {
    submit: (data: KycSubmitData) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
