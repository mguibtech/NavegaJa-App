import {useState} from 'react';

import {safetyService} from '../safetyService';
import {
  SafetyChecklist,
  CreateSafetyChecklistData,
  UpdateSafetyChecklistData,
  ChecklistStatusResponse,
} from '../safetyTypes';

export function useSafetyChecklist() {
  const [checklist, setChecklist] = useState<SafetyChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Criar checklist de segurança (capitão)
   */
  async function create(
    data: CreateSafetyChecklistData,
  ): Promise<SafetyChecklist> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await safetyService.createChecklist(data);
      setChecklist(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Atualizar checklist
   */
  async function update(
    id: string,
    data: UpdateSafetyChecklistData,
  ): Promise<SafetyChecklist> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await safetyService.updateChecklist(id, data);
      setChecklist(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Verificar status do checklist para uma viagem
   */
  async function checkStatus(tripId: string): Promise<ChecklistStatusResponse> {
    setIsLoading(true);
    setError(null);

    try {
      const status = await safetyService.getChecklistStatus(tripId);
      if (status.checklist) {
        setChecklist(status.checklist);
      }
      setIsLoading(false);
      return status;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Buscar checklist por ID de viagem
   */
  async function fetchByTripId(tripId: string): Promise<SafetyChecklist | null> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await safetyService.getChecklistByTripId(tripId);
      setChecklist(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  /**
   * Buscar checklist por ID
   */
  async function fetchById(id: string): Promise<SafetyChecklist> {
    setIsLoading(true);
    setError(null);

    try {
      const result = await safetyService.getChecklistById(id);
      setChecklist(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {
    checklist,
    create,
    update,
    checkStatus,
    fetchByTripId,
    fetchById,
    isLoading,
    error,
  };
}
