import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';

import {
  CaptainAnalyticsSummary,
  RevenueDataPoint,
  RouteAnalytics,
  PassengerAnalytics,
  AnalyticsPeriod,
} from './analyticsTypes';

export const analyticsAPI = {
  getSummary(): Promise<CaptainAnalyticsSummary> {
    return api.get<CaptainAnalyticsSummary>(API_ENDPOINTS.CAPTAIN_ANALYTICS);
  },

  getRevenue(period: AnalyticsPeriod): Promise<RevenueDataPoint[]> {
    return api
      .get<RevenueDataPoint[]>(API_ENDPOINTS.CAPTAIN_ANALYTICS_REVENUE, {params: {period}})
      ;
  },

  getRoutes(): Promise<RouteAnalytics[]> {
    return api.get<RouteAnalytics[]>(API_ENDPOINTS.CAPTAIN_ANALYTICS_ROUTES);
  },

  getPassengers(): Promise<PassengerAnalytics[]> {
    return api
      .get<PassengerAnalytics[]>(API_ENDPOINTS.CAPTAIN_ANALYTICS_PASSENGERS)
      ;
  },
};
