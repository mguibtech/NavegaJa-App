import NetInfo from '@react-native-community/netinfo';
import {AppState, AppStateStatus} from 'react-native';

import {bookingService} from '../domain/App/Booking/bookingService';
import {CreateBookingData} from '../domain/App/Booking/bookingTypes';
import {chatService} from '../domain/App/Chat/chatService';
import {CreateShipmentData, shipmentService} from '../domain/App/Shipment';
import {queryClient} from './queryClient';
import {queryKeys} from './queryKeys';
import {refreshOnlineState} from './networkManager';
import {mmkvAsyncStorage} from './mmkvStorage';

const OFFLINE_QUEUE_STORAGE_KEY = '@navegaja:offline-queue-v1';
const OFFLINE_QUEUE_PROCESSED_KEY = '@navegaja:offline-queue-processed-v1';
const MAX_PROCESSED_IDS = 200;

type ShipmentPhoto = {uri: string; type: string; name: string};

type CreateShipmentJob = {
  id: string;
  type: 'createShipment';
  createdAt: string;
  attempts: number;
  payload: {
    data: CreateShipmentData;
    photos: ShipmentPhoto[];
  };
  lastError?: string;
};

type SendChatMessageJob = {
  id: string;
  type: 'sendChatMessage';
  createdAt: string;
  attempts: number;
  payload: {
    bookingId: string;
    content: string;
  };
  lastError?: string;
};

type CreateBookingJob = {
  id: string;
  type: 'createBooking';
  createdAt: string;
  attempts: number;
  payload: {
    data: CreateBookingData;
  };
  lastError?: string;
};

type CancelBookingJob = {
  id: string;
  type: 'cancelBooking';
  createdAt: string;
  attempts: number;
  payload: {
    bookingId: string;
    reason?: string;
  };
  lastError?: string;
};

type CheckInBookingJob = {
  id: string;
  type: 'checkInBooking';
  createdAt: string;
  attempts: number;
  payload: {
    bookingId: string;
  };
  lastError?: string;
};

type ConfirmShipmentPaymentJob = {
  id: string;
  type: 'confirmShipmentPayment';
  createdAt: string;
  attempts: number;
  payload: {
    shipmentId: string;
    paymentProofUri?: string;
  };
  lastError?: string;
};

type OfflineJob =
  | CreateShipmentJob
  | SendChatMessageJob
  | CreateBookingJob
  | CancelBookingJob
  | CheckInBookingJob
  | ConfirmShipmentPaymentJob;

type ReplaySummary = {
  processed: number;
  failed: number;
  remaining: number;
};

let queueLock: Promise<void> = Promise.resolve();
let replayRunning = false;
let autoSyncStop: (() => void) | null = null;

function runWithQueueLock<T>(task: () => Promise<T>): Promise<T> {
  const next = queueLock.then(task, task);
  queueLock = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function buildOfflineJobId() {
  return `offline-job-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

async function loadQueue(): Promise<OfflineJob[]> {
  const raw = await mmkvAsyncStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as OfflineJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQueue(queue: OfflineJob[]): Promise<void> {
  await mmkvAsyncStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

async function loadProcessedIds(): Promise<string[]> {
  const raw = await mmkvAsyncStorage.getItem(OFFLINE_QUEUE_PROCESSED_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function hasProcessedId(id: string): Promise<boolean> {
  const processedIds = await loadProcessedIds();
  return processedIds.includes(id);
}

async function markProcessed(id: string): Promise<void> {
  const processedIds = await loadProcessedIds();
  const next = [id, ...processedIds.filter(existingId => existingId !== id)].slice(
    0,
    MAX_PROCESSED_IDS,
  );
  await mmkvAsyncStorage.setItem(OFFLINE_QUEUE_PROCESSED_KEY, JSON.stringify(next));
}

function normalizeQueueError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido ao processar fila offline.';
}

async function processCreateShipmentJob(job: CreateShipmentJob): Promise<void> {
  await shipmentService.createShipment(job.payload.data, job.payload.photos);
  await queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
}

async function processSendChatMessageJob(job: SendChatMessageJob): Promise<void> {
  await chatService.sendMessage(job.payload.bookingId, job.payload.content);
  await queryClient.invalidateQueries({
    queryKey: queryKeys.chat.messages(job.payload.bookingId),
  });
  await queryClient.invalidateQueries({queryKey: queryKeys.chat.conversations()});
}

async function processCreateBookingJob(job: CreateBookingJob): Promise<void> {
  const booking = await bookingService.createBooking(job.payload.data);
  await queryClient.invalidateQueries({queryKey: queryKeys.bookings.my()});
  await queryClient.invalidateQueries({
    queryKey: queryKeys.trips.detail(job.payload.data.tripId),
  });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.bookings.detail(booking.id),
  });
}

async function processCancelBookingJob(job: CancelBookingJob): Promise<void> {
  await bookingService.cancelBooking(job.payload.bookingId, job.payload.reason);
  await queryClient.invalidateQueries({queryKey: queryKeys.bookings.my()});
  await queryClient.invalidateQueries({
    queryKey: queryKeys.bookings.detail(job.payload.bookingId),
  });
}

async function processCheckInBookingJob(job: CheckInBookingJob): Promise<void> {
  const booking = await bookingService.checkInBooking(job.payload.bookingId);
  await queryClient.invalidateQueries({queryKey: queryKeys.bookings.my()});
  await queryClient.invalidateQueries({
    queryKey: queryKeys.bookings.detail(job.payload.bookingId),
  });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.bookings.tracking(job.payload.bookingId),
  });
  await queryClient.invalidateQueries({
    queryKey: queryKeys.trips.detail(booking.tripId),
  });
  await queryClient.invalidateQueries({queryKey: queryKeys.captain.all});
}

async function processConfirmShipmentPaymentJob(
  job: ConfirmShipmentPaymentJob,
): Promise<void> {
  let paymentProof: string | undefined;
  if (job.payload.paymentProofUri) {
    const photoData = {
      uri: job.payload.paymentProofUri,
      type: 'image/jpeg',
      name: `payment-proof-${Date.now()}.jpg`,
    };
    const urls = await shipmentService.uploadPhotosToS3([photoData]);
    paymentProof = urls[0];
  }

  await shipmentService.confirmPayment(job.payload.shipmentId, {paymentProof});
  await queryClient.invalidateQueries({queryKey: queryKeys.shipments.my()});
  await queryClient.invalidateQueries({
    queryKey: queryKeys.shipments.detail(job.payload.shipmentId),
  });
}

async function processJob(job: OfflineJob): Promise<void> {
  if (job.type === 'createShipment') {
    await processCreateShipmentJob(job);
    return;
  }

  if (job.type === 'createBooking') {
    await processCreateBookingJob(job);
    return;
  }

  if (job.type === 'cancelBooking') {
    await processCancelBookingJob(job);
    return;
  }

  if (job.type === 'checkInBooking') {
    await processCheckInBookingJob(job);
    return;
  }

  if (job.type === 'confirmShipmentPayment') {
    await processConfirmShipmentPaymentJob(job);
    return;
  }

  await processSendChatMessageJob(job);
}

export function enqueueCreateShipment(
  data: CreateShipmentData,
  photos: ShipmentPhoto[],
): Promise<CreateShipmentJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: CreateShipmentJob = {
      id: buildOfflineJobId(),
      type: 'createShipment',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        data,
        photos,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function enqueueChatMessage(
  bookingId: string,
  content: string,
): Promise<SendChatMessageJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: SendChatMessageJob = {
      id: buildOfflineJobId(),
      type: 'sendChatMessage',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        bookingId,
        content,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function enqueueCreateBooking(
  data: CreateBookingData,
): Promise<CreateBookingJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: CreateBookingJob = {
      id: buildOfflineJobId(),
      type: 'createBooking',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        data,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function enqueueCancelBooking(
  bookingId: string,
  reason?: string,
): Promise<CancelBookingJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: CancelBookingJob = {
      id: buildOfflineJobId(),
      type: 'cancelBooking',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        bookingId,
        reason,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function enqueueCheckInBooking(bookingId: string): Promise<CheckInBookingJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: CheckInBookingJob = {
      id: buildOfflineJobId(),
      type: 'checkInBooking',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        bookingId,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function enqueueConfirmShipmentPayment(
  shipmentId: string,
  paymentProofUri?: string,
): Promise<ConfirmShipmentPaymentJob> {
  return runWithQueueLock(async () => {
    const queue = await loadQueue();
    const job: ConfirmShipmentPaymentJob = {
      id: buildOfflineJobId(),
      type: 'confirmShipmentPayment',
      createdAt: new Date().toISOString(),
      attempts: 0,
      payload: {
        shipmentId,
        paymentProofUri,
      },
    };

    await saveQueue([...queue, job]);
    return job;
  });
}

export function replayOfflineQueue(): Promise<ReplaySummary> {
  return runWithQueueLock(async () => {
    if (replayRunning) {
      const queue = await loadQueue();
      return {processed: 0, failed: 0, remaining: queue.length};
    }

    replayRunning = true;

    try {
      const isOnline = await refreshOnlineState();
      const queue = await loadQueue();

      if (!isOnline || queue.length === 0) {
        return {processed: 0, failed: 0, remaining: queue.length};
      }

      const remainingQueue: OfflineJob[] = [];
      let processed = 0;
      let failed = 0;

      for (const job of queue) {
        const alreadyProcessed = await hasProcessedId(job.id);
        if (alreadyProcessed) {
          continue;
        }

        try {
          await processJob(job);
          await markProcessed(job.id);
          processed += 1;
        } catch (error) {
          failed += 1;
          remainingQueue.push({
            ...job,
            attempts: job.attempts + 1,
            lastError: normalizeQueueError(error),
          });
        }
      }

      await saveQueue(remainingQueue);
      return {
        processed,
        failed,
        remaining: remainingQueue.length,
      };
    } finally {
      replayRunning = false;
    }
  });
}

export function startOfflineQueueAutoSync(): () => void {
  if (autoSyncStop) {
    return autoSyncStop;
  }

  const handleMaybeSync = async () => {
    await replayOfflineQueue();
  };

  const netUnsubscribe = NetInfo.addEventListener(state => {
    const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
    if (isOnline) {
      handleMaybeSync().catch(() => {});
    }
  });

  const appStateSubscription = AppState.addEventListener(
    'change',
    (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        handleMaybeSync().catch(() => {});
      }
    },
  );

  handleMaybeSync().catch(() => {});

  autoSyncStop = () => {
    netUnsubscribe();
    appStateSubscription.remove();
    autoSyncStop = null;
  };

  return autoSyncStop;
}
