import {tripAPI} from './tripAPI';
import {SearchTripsParams, Trip} from './tripTypes';

class TripService {
  async searchTrips(params: SearchTripsParams): Promise<Trip[]> {
    const trips = await tripAPI.search(params);

    // Aqui você pode adicionar lógica de negócio:
    // - Filtrar trips inválidos
    // - Ordenar por preço/horário
    // - Adicionar dados calculados

    return trips.sort((a, b) => a.price - b.price);
  }

  async getTripById(id: string): Promise<Trip> {
    return await tripAPI.getById(id);
  }
}

export const tripService = new TripService();
