import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {safetyService} from '../safetyService';
import {PersonalContact, CreatePersonalContactData} from '../safetyTypes';

export function usePersonalContacts() {
  const queryClient = useQueryClient();

  const query = useQuery<PersonalContact[], Error>({
    queryKey: queryKeys.safety.personalContacts(),
    queryFn: () => safetyService.getPersonalContacts(),
  });

  const addMutation = useMutation<PersonalContact, Error, CreatePersonalContactData>({
    mutationFn: data => safetyService.createPersonalContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.safety.personalContacts()});
    },
  });

  const removeMutation = useMutation<void, Error, string>({
    mutationFn: id => safetyService.deletePersonalContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.safety.personalContacts()});
    },
  });

  return {
    contacts: query.data ?? [],
    isLoading: query.isLoading,
    addContact: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    removeContact: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
    refetch: query.refetch,
  };
}
