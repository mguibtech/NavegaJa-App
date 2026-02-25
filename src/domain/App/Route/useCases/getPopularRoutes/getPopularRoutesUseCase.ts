import {routeService} from '../../routeService';
import {Route} from '../../routeTypes';

export async function getPopularRoutesUseCase(): Promise<Route[]> {
  return routeService.getPopularRoutes();
}
