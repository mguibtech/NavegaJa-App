import {routeService} from '../../routeService';
import {Route} from '../../routeTypes';

export async function searchRoutesUseCase(
  origin: string,
  destination: string,
): Promise<Route[]> {
  return routeService.searchRoutes({origin, destination});
}
