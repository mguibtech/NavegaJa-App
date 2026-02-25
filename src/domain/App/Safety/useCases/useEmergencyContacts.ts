import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {safetyService} from '../safetyService';
import {EmergencyContact} from '../safetyTypes';

export function useEmergencyContacts() {
  const query = useQuery<EmergencyContact[], Error>({
    queryKey: queryKeys.safety.contacts(),
    queryFn: () => safetyService.getEmergencyContacts(),
  });

  return {
    contacts: query.data ?? [],
    fetch: query.refetch,
    isLoading: query.isLoading,
    error: query.error,
  };
}
