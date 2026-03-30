import {useState} from 'react';

import {
  enqueueCreateShipment,
  isLikelyOfflineError,
  OfflineQueuedError,
  refreshOnlineState,
} from '@infra';
import {shipmentService} from '../shipmentService';
import {Shipment, CreateShipmentData} from '../shipmentTypes';

export function useCreateShipment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: CreateShipmentData,
    photos: Array<{uri: string; type: string; name: string}>,
  ): Promise<Shipment> => {
    const createOfflineQueuedError = (jobId: string) =>
      new OfflineQueuedError(
        'Sem internet. A encomenda foi salva e sera enviada automaticamente quando a conexao voltar.',
        jobId,
      );

    setIsLoading(true);
    try {
      const isOnline = await refreshOnlineState();
      if (!isOnline) {
        const queuedJob = await enqueueCreateShipment(data, photos);
        const queuedError = createOfflineQueuedError(queuedJob.id);
        setError(queuedError);
        throw queuedError;
      }

      const shipment = await shipmentService.createShipment(data, photos);
      setError(null);
      return shipment;
    } catch (e) {
      if (isLikelyOfflineError(e)) {
        const queuedJob = await enqueueCreateShipment(data, photos);
        const queuedError = createOfflineQueuedError(queuedJob.id);
        setError(queuedError);
        throw queuedError;
      }

      setError(e as Error);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {create, isLoading, error};
}
