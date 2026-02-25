import {useState} from 'react';

import {locationService} from '../locationService';

export function useLocationLabel() {
  const [label, setLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchLabel(lat: number, lng: number): Promise<string | null> {
    setIsLoading(true);
    try {
      const data = await locationService.getLocationLabel(lat, lng);
      setLabel(data.label);
      return data.label;
    } catch {
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function clear() {
    setLabel(null);
  }

  return {label, fetchLabel, clear, isLoading};
}
