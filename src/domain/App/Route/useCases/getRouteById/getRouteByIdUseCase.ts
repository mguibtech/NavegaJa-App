import {routeService} from '../../routeService';
import {Route} from '../../routeTypes';

export async function getRouteByIdUseCase(routeId: string): Promise<Route> {
  return routeService.getById(routeId);
}
