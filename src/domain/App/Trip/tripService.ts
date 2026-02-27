import {tripAPI} from './tripAPI';
import {SearchTripsParams, Trip, TripManageData} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';

async function searchTrips(params: SearchTripsParams): Promise<Trip[]> {
  const trips = await tripAPI.search(params);

  // Aqui você pode adicionar lógica de negócio:
  // - Filtrar trips inválidos
  // - Ordenar por preço/horário
  // - Adicionar dados calculados

  return trips.sort((a, b) => Number(a.price) - Number(b.price));
}

async function getTripById(id: string): Promise<Trip> {
  return await tripAPI.getById(id);
}

async function getPopular(): Promise<PopularDestinationsResponse> {
  return await tripAPI.getPopular();
}

async function getTripManage(id: string): Promise<TripManageData> {
  return await tripAPI.getTripManage(id);
}

export const tripService = {
  searchTrips,
  getTripById,
  getPopular,
  getTripManage,
};
