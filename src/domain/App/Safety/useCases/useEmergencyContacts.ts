import {useState, useEffect} from 'react';

import {safetyService} from '../safetyService';
import {EmergencyContact} from '../safetyTypes';

export function useEmergencyContacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function fetch() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await safetyService.getEmergencyContacts();
      setContacts(data);
      setIsLoading(false);
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }

  // Auto-fetch on mount
  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    contacts,
    fetch,
    isLoading,
    error,
  };
}
