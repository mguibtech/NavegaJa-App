import {useState} from 'react';

import {safetyService} from '../safetyService';
import {SosAlert, CreateSosAlertData, SosType} from '../safetyTypes';

export function useSosAlert() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeAlert, setActiveAlert] = useState<SosAlert | null>(null);

  /**
   * Criar alerta SOS com localização atual
   */
  async function createAlert(
    type: SosType,
    options?: {
      tripId?: string;
      description?: string;
      contactNumber?: string;
    },
  ): Promise<SosAlert> {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Obter localização atual
      const location = await safetyService.getCurrentLocation();

      // 2. Criar alerta
      const data: CreateSosAlertData = {
        type,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        tripId: options?.tripId,
        description: options?.description,
        contactNumber: options?.contactNumber,
      };

      const alert = await safetyService.createSosAlert(data);
      setActiveAlert(alert);
      setIsLoading(false);
      return alert;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  /**
   * Cancelar alerta SOS
   */
  async function cancelAlert(id: string): Promise<SosAlert> {
    setIsLoading(true);
    setError(null);

    try {
      const alert = await safetyService.cancelSosAlert(id);
      setActiveAlert(null);
      setIsLoading(false);
      return alert;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  /**
   * Verificar se há alerta ativo
   */
  async function checkActiveAlert(): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const alert = await safetyService.getActiveAlert();
      setActiveAlert(alert);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
    }
  }

  /**
   * Buscar meus alertas
   */
  async function fetchMyAlerts(): Promise<SosAlert[]> {
    setIsLoading(true);
    setError(null);

    try {
      const alerts = await safetyService.getMySosAlerts();
      const active = alerts.find(a => a.status === 'active') || null;
      setActiveAlert(active);
      setIsLoading(false);
      return alerts;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  return {
    createAlert,
    cancelAlert,
    checkActiveAlert,
    fetchMyAlerts,
    activeAlert,
    isLoading,
    error,
  };
}
