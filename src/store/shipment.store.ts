import {create} from 'zustand';

import {Shipment} from '@types';

interface ShipmentState {
  shipments: Shipment[];
  currentShipment: Shipment | null;
  isLoading: boolean;

  // Actions
  createShipment: (formData: FormData) => Promise<void>;
  getMyShipments: () => Promise<void>;
  trackShipment: (trackingCode: string) => Promise<void>;
  reportIncident: (
    shipmentId: string,
    type: string,
    description: string,
    photo?: string,
  ) => Promise<void>;
  setCurrentShipment: (shipment: Shipment | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useShipmentStore = create<ShipmentState>((set, get) => ({
  // Initial State
  shipments: [],
  currentShipment: null,
  isLoading: false,

  // Actions
  createShipment: async (formData: FormData) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando shipmentsApi estiver pronto
      // const shipment = await shipmentsApi.create(formData);
      // set({currentShipment: shipment, isLoading: false});
      console.log('Create shipment:', formData);
      set({isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  getMyShipments: async () => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando shipmentsApi estiver pronto
      // const shipments = await shipmentsApi.getMyShipments();
      // set({shipments, isLoading: false});
      console.log('Get my shipments');
      set({shipments: [], isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  trackShipment: async (trackingCode: string) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando shipmentsApi estiver pronto
      // const shipment = await shipmentsApi.track(trackingCode);
      // set({currentShipment: shipment, isLoading: false});
      console.log('Track shipment:', trackingCode);
      set({currentShipment: null, isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  reportIncident: async (
    shipmentId: string,
    type: string,
    description: string,
    photo?: string,
  ) => {
    set({isLoading: true});
    try {
      // TODO: Implementar quando shipmentsApi estiver pronto
      // await shipmentsApi.reportIncident(shipmentId, {type, description, photo});
      console.log('Report incident:', shipmentId, type, description, photo);
      set({isLoading: false});
    } catch (error) {
      set({isLoading: false});
      throw error;
    }
  },

  setCurrentShipment: (shipment: Shipment | null) => {
    set({currentShipment: shipment});
  },

  setLoading: (isLoading: boolean) => {
    set({isLoading});
  },
}));
