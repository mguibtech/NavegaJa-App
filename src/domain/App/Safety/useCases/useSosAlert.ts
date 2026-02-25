import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {safetyService} from '../safetyService';
import {SosAlert, CreateSosAlertData, SosType} from '../safetyTypes';

export function useSosAlert() {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery<SosAlert[], Error>({
    queryKey: queryKeys.safety.sosAlerts(),
    queryFn: () => safetyService.getMySosAlerts(),
  });

  const activeAlert = (alertsQuery.data ?? []).find(a => a.status === 'active') ?? null;

  const createMutation = useMutation<SosAlert, Error, {type: SosType; options?: {tripId?: string; description?: string; contactNumber?: string}}>({
    mutationFn: async ({type, options}) => {
      const location = await safetyService.getCurrentLocation();
      const data: CreateSosAlertData = {
        type,
        location: {latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy},
        tripId: options?.tripId,
        description: options?.description,
        contactNumber: options?.contactNumber,
      };
      return safetyService.createSosAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.safety.sosAlerts()});
    },
  });

  const cancelMutation = useMutation<SosAlert, Error, string>({
    mutationFn: (id: string) => safetyService.cancelSosAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.safety.sosAlerts()});
    },
  });

  return {
    createAlert: (type: SosType, options?: {tripId?: string; description?: string; contactNumber?: string}) =>
      createMutation.mutateAsync({type, options}),
    cancelAlert: cancelMutation.mutateAsync,
    checkActiveAlert: alertsQuery.refetch,
    fetchMyAlerts: alertsQuery.refetch,
    alerts: alertsQuery.data ?? [],
    activeAlert,
    isLoading: createMutation.isPending || cancelMutation.isPending || alertsQuery.isLoading,
    error: createMutation.error ?? cancelMutation.error ?? alertsQuery.error,
  };
}
