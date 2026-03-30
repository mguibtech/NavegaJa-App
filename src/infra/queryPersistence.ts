import {createSyncStoragePersister} from '@tanstack/query-sync-storage-persister';
import {PersistQueryClientOptions} from '@tanstack/react-query-persist-client';

import {mmkvSyncStorage} from './mmkvStorage';

const QUERY_CACHE_STORAGE_KEY = '@navegaja:query-cache-v1';
const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24h

export const queryPersister = createSyncStoragePersister({
  storage: mmkvSyncStorage,
  key: QUERY_CACHE_STORAGE_KEY,
  throttleTime: 1000,
});

export const persistQueryClientOptions: Omit<
  PersistQueryClientOptions,
  'queryClient'
> = {
  persister: queryPersister,
  maxAge: QUERY_CACHE_MAX_AGE,
  buster: 'navegaja-v10-offline-first',
  dehydrateOptions: {
    // Persist only successful responses to avoid restoring failed/partial states.
    shouldDehydrateQuery: query => query.state.status === 'success',
  },
};
