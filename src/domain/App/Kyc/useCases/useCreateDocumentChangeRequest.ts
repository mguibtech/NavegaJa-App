import {useMutation, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {kycService} from '../kycService';
import {
  CreateDocumentChangeRequestData,
  DocumentChangeRequest,
} from '../kycTypes';

export function useCreateDocumentChangeRequest() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    DocumentChangeRequest,
    Error,
    CreateDocumentChangeRequestData
  >({
    mutationFn: data => kycService.createDocumentChangeRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.kyc.documentChangeRequests(),
      });
      queryClient.invalidateQueries({queryKey: queryKeys.kyc.status()});
    },
  });

  return {
    createDocumentChangeRequest: (data: CreateDocumentChangeRequestData) =>
      mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
