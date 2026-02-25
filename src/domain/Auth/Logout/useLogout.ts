import {useMutation, useQueryClient} from '@tanstack/react-query';

import {logoutService} from './logoutService';

export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await logoutService.execute();
      queryClient.clear();
    },
  });

  return {
    logout: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
