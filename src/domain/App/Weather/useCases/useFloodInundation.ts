import {useQuery} from '@tanstack/react-query';

import {floodHubAPI} from '../floodHubAPI';
import {FloodInundationData} from '../floodHubTypes';

// Arredonda coords para ~1 km de precisão — evita refetch em cada atualização de GPS
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function useFloodInundation(lat: number, lng: number) {
  const rLat = round2(lat);
  const rLng = round2(lng);

  const {data} = useQuery<FloodInundationData>({
    queryKey: ['flood-inundation', rLat, rLng],
    queryFn: () => floodHubAPI.getInundation(rLat, rLng),
    refetchInterval: 30 * 60 * 1000,  // 30 min — backend faz cache por 30 min
    staleTime: 25 * 60 * 1000,
  });

  return {inundation: data ?? null};
}
