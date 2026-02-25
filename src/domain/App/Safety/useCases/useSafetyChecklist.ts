import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {safetyService} from '../safetyService';
import {
  SafetyChecklist,
  CreateSafetyChecklistData,
  UpdateSafetyChecklistData,
  ChecklistStatusResponse,
} from '../safetyTypes';

export function useSafetyChecklist(tripId?: string) {
  const queryClient = useQueryClient();

  const checklistQuery = useQuery<SafetyChecklist | null, Error>({
    queryKey: queryKeys.safety.checklist(tripId ?? ''),
    queryFn: () => tripId ? safetyService.getChecklistByTripId(tripId) : null,
    enabled: !!tripId,
  });

  const createMutation = useMutation<SafetyChecklist, Error, CreateSafetyChecklistData>({
    mutationFn: (data: CreateSafetyChecklistData) => safetyService.createChecklist(data),
    onSuccess: () => {
      if (tripId) {queryClient.invalidateQueries({queryKey: queryKeys.safety.checklist(tripId)});}
    },
  });

  const updateMutation = useMutation<SafetyChecklist, Error, {id: string; data: UpdateSafetyChecklistData}>({
    mutationFn: ({id, data}) => safetyService.updateChecklist(id, data),
    onSuccess: () => {
      if (tripId) {queryClient.invalidateQueries({queryKey: queryKeys.safety.checklist(tripId)});}
    },
  });

  return {
    checklist: checklistQuery.data ?? null,
    create: createMutation.mutateAsync,
    update: (id: string, data: UpdateSafetyChecklistData) => updateMutation.mutateAsync({id, data}),
    checkStatus: (tId: string): Promise<ChecklistStatusResponse> => safetyService.getChecklistStatus(tId),
    fetchByTripId: (tId: string) => safetyService.getChecklistByTripId(tId),
    fetchById: (id: string) => safetyService.getChecklistById(id),
    isLoading: checklistQuery.isLoading || createMutation.isPending || updateMutation.isPending,
    error: checklistQuery.error ?? createMutation.error ?? updateMutation.error,
  };
}
