import {tripAPI} from './tripAPI';
import {SearchTripsParams, Trip} from './tripTypes';
import {PopularDestinationsResponse} from './popularRoutesTypes';

class TripService {
  async searchTrips(params: SearchTripsParams): Promise<Trip[]> {
    const trips = await tripAPI.search(params);

    // Aqui você pode adicionar lógica de negócio:
    // - Filtrar trips inválidos
    // - Ordenar por preço/horário
    // - Adicionar dados calculados

    return trips.sort((a, b) => Number(a.price) - Number(b.price));
  }

  async getTripById(id: string): Promise<Trip> {
    return await tripAPI.getById(id);
  }

  async getPopular(): Promise<PopularDestinationsResponse> {
    return await tripAPI.getPopular();
  }
}

export const tripService = new TripService();
