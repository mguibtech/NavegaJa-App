import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';

import {queryKeys} from '@infra';

import {analyticsAPI} from '../analyticsAPI';
import {AnalyticsPeriod} from '../analyticsTypes';

export function useCaptainAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');

  const summary = useQuery({
    queryKey: queryKeys.analytics.summary(),
    queryFn: analyticsAPI.getSummary,
    staleTime: 5 * 60 * 1000,
  });

  const revenue = useQuery({
    queryKey: queryKeys.analytics.revenue(period),
    queryFn: () => analyticsAPI.getRevenue(period),
    staleTime: 5 * 60 * 1000,
  });

  const routes = useQuery({
    queryKey: queryKeys.analytics.routes(),
    queryFn: analyticsAPI.getRoutes,
    staleTime: 10 * 60 * 1000,
  });

  const passengers = useQuery({
    queryKey: queryKeys.analytics.passengers(),
    queryFn: analyticsAPI.getPassengers,
    staleTime: 10 * 60 * 1000,
  });

  return {
    summary: summary.data ?? null,
    revenue: revenue.data ?? [],
    routes: routes.data ?? [],
    passengers: passengers.data ?? [],
    isLoading: summary.isLoading || revenue.isLoading,
    period,
    setPeriod,
  };
}
