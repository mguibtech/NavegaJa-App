// Google Flood Forecasting API — Client
//
// O backend NavegaJá expõe estes endpoints públicos (@Public):
//   GET /weather/flood/status?lat=X&lng=Y&radiusKm=50
//   GET /weather/flood/gauge/:gaugeId/model
//   GET /weather/flood/gauge/:gaugeId/forecast?days=7
//   GET /weather/flood/events?lat=X&lng=Y&radiusKm=500
//   GET /weather/flood/inundation?lat=X&lng=Y&radiusKm=50
//
// Enquanto o Google não aprovar a API, o backend retorna source:'mock'.
// source:'flood_hub' → dados reais do Google Flood Hub.

import {api} from '@api';
import {FloodForecastData, FloodGaugeModel, FloodInundationData} from './floodHubTypes';

async function getFloodStatus(
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<FloodForecastData> {
  return api.get<FloodForecastData>(
    `/weather/flood/status?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
  );
}

async function getGaugeModel(gaugeId: string): Promise<FloodGaugeModel> {
  return api.get<FloodGaugeModel>(`/weather/flood/gauge/${gaugeId}/model`);
}

async function getInundation(
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<FloodInundationData> {
  return api.get<FloodInundationData>(
    `/weather/flood/inundation?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
  );
}

export const floodHubAPI = {
  getFloodStatus,
  getGaugeModel,
  getInundation,
};
