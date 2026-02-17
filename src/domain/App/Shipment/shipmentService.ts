import AsyncStorage from '@react-native-async-storage/async-storage';

import {api} from '@api';
import {API_BASE_URL} from '../../../api/config';
import {shipmentAPI} from './shipmentAPI';
import {
  Shipment,
  CreateShipmentData,
  CalculateShipmentPriceRequest,
  CalculateShipmentPriceResponse,
  TrackShipmentResponse,
  ShipmentStatus,
} from './shipmentTypes';

const SHIPMENTS_STORAGE_KEY = '@navegaja:shipments';

class ShipmentService {
  /**
   * Calcular preço da encomenda
   */
  async calculatePrice(
    request: CalculateShipmentPriceRequest,
  ): Promise<CalculateShipmentPriceResponse> {
    return await shipmentAPI.calculatePrice(request);
  }

  /**
   * Buscar minhas encomendas (com cache offline)
   */
  async getMyShipments(): Promise<Shipment[]> {
    try {
      const shipments = await shipmentAPI.getMyShipments();

      // Save offline
      await this.saveOffline(shipments);

      return shipments;
    } catch {
      // Se falhar, tenta carregar do cache offline
      console.warn('Failed to fetch shipments from API, loading from cache');
      return await this.loadOffline();
    }
  }

  /**
   * Upload de fotos para S3 usando presigned URLs
   * Retorna as URLs públicas das fotos
   */
  async uploadPhotosToS3(
    photos: Array<{uri: string; type: string; name: string}>,
  ): Promise<string[]> {
    if (photos.length === 0) {
      return [];
    }

    try {
      const uploadPromises = photos.map(async photo => {
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || 'photo.jpg',
        } as any);

        const response = await api.upload<{url: string}>('/upload/image', formData);

        // Backend retorna URL relativa (/uploads/xxx.jpg) → converter para URL absoluta
        return response.url.startsWith('http')
          ? response.url
          : `${API_BASE_URL}${response.url}`;
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw new Error('Falha ao fazer upload das fotos. Tente novamente.');
    }
  }

  /**
   * Criar encomenda com fotos direto no FormData (multipart/form-data)
   */
  async createShipment(
    data: CreateShipmentData,
    photos: Array<{uri: string; type: string; name: string}>,
  ): Promise<Shipment> {
    const formData = new FormData();

    formData.append('recipientName', data.recipientName);
    formData.append('recipientPhone', data.recipientPhone);
    formData.append('recipientAddress', data.recipientAddress);
    formData.append('description', data.description);
    formData.append('weight', data.weight.toString());
    formData.append('tripId', data.tripId);
    formData.append('paymentMethod', data.paymentMethod);

    if (data.couponCode) {
      formData.append('couponCode', data.couponCode);
    }

    if (data.dimensions) {
      formData.append('dimensions', JSON.stringify(data.dimensions));
    }

    // Fotos enviadas como arquivos diretamente no FormData
    photos.forEach(photo => {
      formData.append('photos', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.name || 'photo.jpg',
      } as any);
    });

    const shipment = await shipmentAPI.create(formData);

    // Salvar offline
    const stored = await this.loadOffline();
    await this.saveOffline([shipment, ...stored]);

    return shipment;
  }

  /**
   * Buscar encomenda por ID
   */
  async getById(id: string): Promise<Shipment> {
    return await shipmentAPI.getById(id);
  }

  /**
   * Rastrear encomenda
   */
  async trackShipment(trackingCode: string): Promise<TrackShipmentResponse> {
    return await shipmentAPI.track(trackingCode);
  }

  /**
   * Cancelar encomenda
   */
  async cancelShipment(id: string, reason?: string): Promise<void> {
    await shipmentAPI.cancel(id, {reason});

    // Atualizar status no cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s =>
      s.id === id ? {...s, status: ShipmentStatus.CANCELLED} : s,
    );
    await this.saveOffline(updated);
  }

  /**
   * Atualizar status (apenas capitão)
   */
  async updateStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    const shipment = await shipmentAPI.updateStatus(id, status);

    // Atualizar cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s => (s.id === id ? shipment : s));
    await this.saveOffline(updated);

    return shipment;
  }

  /**
   * Confirmar entrega (apenas capitão)
   */
  async confirmDelivery(id: string): Promise<Shipment> {
    const shipment = await shipmentAPI.confirmDelivery(id);

    // Atualizar cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s => (s.id === id ? shipment : s));
    await this.saveOffline(updated);

    return shipment;
  }

  /**
   * v2.0 - Confirmar pagamento (upload comprovante Pix)
   * PENDING → PAID
   */
  async confirmPayment(
    id: string,
    data: {paymentProof?: string},
  ): Promise<{shipment: Shipment; message: string}> {
    const response = await shipmentAPI.confirmPayment(id, data);

    // Atualizar cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s => (s.id === id ? response.shipment : s));
    await this.saveOffline(updated);

    return response;
  }

  /**
   * v2.0 - Coletar encomenda (capitão valida QR Code + foto)
   * PAID → COLLECTED
   */
  async collectShipment(
    id: string,
    data: {validationCode?: string; collectionPhoto?: string},
  ): Promise<{shipment: Shipment; message: string}> {
    const response = await shipmentAPI.collectShipment(id, data);

    // Atualizar cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s => (s.id === id ? response.shipment : s));
    await this.saveOffline(updated);

    return response;
  }

  /**
   * v2.0 - Validar entrega (destinatário valida PIN + foto)
   * OUT_FOR_DELIVERY → DELIVERED
   * Credita NavegaCoins
   */
  async validateDelivery(
    trackingCode: string,
    data: {validationCode: string; deliveryPhoto?: string},
  ): Promise<{shipment: Shipment; message: string; navegaCoinsEarned?: number}> {
    const response = await shipmentAPI.validateDelivery(trackingCode, data);

    // Atualizar cache offline se existir
    const stored = await this.loadOffline();
    const updated = stored.map(s =>
      s.trackingCode === trackingCode ? response.shipment : s,
    );
    await this.saveOffline(updated);

    return response;
  }

  /**
   * v2.0 - Marcar como "Saiu para Entrega" (capitão)
   * ARRIVED → OUT_FOR_DELIVERY
   */
  async outForDelivery(
    id: string,
  ): Promise<{shipment: Shipment; message: string}> {
    const response = await shipmentAPI.outForDelivery(id);

    // Atualizar cache offline
    const stored = await this.loadOffline();
    const updated = stored.map(s => (s.id === id ? response.shipment : s));
    await this.saveOffline(updated);

    return response;
  }

  /**
   * Deletar encomenda
   */
  async deleteShipment(id: string): Promise<void> {
    await shipmentAPI.delete(id);

    // Remover do cache offline
    const stored = await this.loadOffline();
    const filtered = stored.filter(s => s.id !== id);
    await this.saveOffline(filtered);
  }

  /**
   * Carregar encomendas do cache offline
   */
  async loadOffline(): Promise<Shipment[]> {
    try {
      const stored = await AsyncStorage.getItem(SHIPMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading shipments from offline storage:', error);
      return [];
    }
  }

  /**
   * Salvar encomendas no cache offline
   */
  private async saveOffline(shipments: Shipment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        SHIPMENTS_STORAGE_KEY,
        JSON.stringify(shipments),
      );
    } catch (error) {
      console.error('Error saving shipments offline:', error);
    }
  }
}

export const shipmentService = new ShipmentService();
