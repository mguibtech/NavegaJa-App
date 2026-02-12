import {api} from '@api';

import {Route} from '../../routeTypes';

export async function getRouteByIdUseCase(routeId: string): Promise<Route> {
  const response = await api.get<Route>(`/routes/${routeId}`);
  return response;
}
