import {routeAPI} from './routeAPI';
import {Route, SearchRouteParams} from './routeTypes';

async function getPopularRoutes(): Promise<Route[]> {
  return routeAPI.getPopular();
}

async function getById(routeId: string): Promise<Route> {
  return routeAPI.getById(routeId);
}

async function searchRoutes(params: SearchRouteParams): Promise<Route[]> {
  return routeAPI.search(params);
}

export const routeService = {
  getPopularRoutes,
  getById,
  searchRoutes,
};
