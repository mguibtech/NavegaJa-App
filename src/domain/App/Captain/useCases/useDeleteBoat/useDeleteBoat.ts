import {useState} from 'react';

import {captainAPI} from '../../captainAPI';

export function useDeleteBoat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function deleteBoat(id: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      await captainAPI.deleteBoat(id);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return {deleteBoat, isLoading, error};
}
