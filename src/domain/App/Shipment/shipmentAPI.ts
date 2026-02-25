import {api} from '@api';

import {
  Shipment,
  CancelShipmentData,
  TrackShipmentResponse,
  CalculateShipmentPriceRequest,
  CalculateShipmentPriceResponse,
  ShipmentReview,
  CreateShipmentReviewData,
  ShipmentTimelineEvent,
  ShipmentStatus,
  GetPresignedUrlsRequest,
  GetPresignedUrlsResponse,
  ConfirmPaymentData,
  ConfirmPaymentResponse,
  CollectShipmentData,
  CollectShipmentResponse,
  ValidateDeliveryData,
  ValidateDeliveryResponse,
  OutForDeliveryResponse,
  ReportIncidentData,
  ValidateQRResponse,
} from './shipmentTypes';

/**
 * Calcular preço da encomenda (antes de criar)
 * POST /shipments/calculate-price
 */
async function calculatePrice(
  data: CalculateShipmentPriceRequest,
): Promise<CalculateShipmentPriceResponse> {
  const response = await api.post<CalculateShipmentPriceResponse>(
    '/shipments/calculate-price',
    data,
  );
  return response;
}

/**
 * Obter presigned URLs para upload direto no S3
 * POST /shipments/upload/presigned-urls
 */
async function getPresignedUrls(
  data: GetPresignedUrlsRequest,
): Promise<GetPresignedUrlsResponse> {
  const response = await api.post<GetPresignedUrlsResponse>(
    '/shipments/upload/presigned-urls',
    data,
  );
  return response;
}

/**
 * Criar nova encomenda
 * POST /shipments
 * Envia FormData com fotos (multipart/form-data)
 */
async function create(formData: FormData): Promise<Shipment> {
  const response = await api.upload<Shipment>('/shipments', formData);
  return response;
}

/**
 * Buscar minhas encomendas
 * GET /shipments/my-shipments
 */
async function getMyShipments(): Promise<Shipment[]> {
  const response = await api.get<Shipment[]>('/shipments/my-shipments');
  return response;
}

/**
 * Rastrear encomenda por código de rastreamento
 * GET /shipments/track/:code
 * Endpoint público (não requer autenticação)
 */
async function track(trackingCode: string): Promise<TrackShipmentResponse> {
  const response = await api.get<TrackShipmentResponse>(
    `/shipments/track/${trackingCode}`,
  );
  return response;
}

/**
 * Buscar encomenda por ID
 * GET /shipments/:id
 */
async function getById(id: string): Promise<Shipment> {
  const response = await api.get<Shipment>(`/shipments/${id}`);
  return response;
}

/**
 * Buscar timeline de eventos da encomenda
 * GET /shipments/:id/timeline
 */
async function getTimeline(id: string): Promise<ShipmentTimelineEvent[]> {
  const response = await api.get<ShipmentTimelineEvent[]>(
    `/shipments/${id}/timeline`,
  );
  return response;
}

/**
 * Cancelar encomenda
 * POST /shipments/:id/cancel
 */
async function cancel(id: string, data?: CancelShipmentData): Promise<void> {
  await api.post(`/shipments/${id}/cancel`, data);
}

/**
 * Atualizar status da encomenda (apenas capitão)
 * PATCH /shipments/:id/status
 */
async function updateStatus(
  id: string,
  status: ShipmentStatus,
): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/status`, {
    status,
  });
  return response;
}

/**
 * Confirmar entrega da encomenda (apenas capitão)
 * PATCH /shipments/:id/deliver
 */
async function confirmDelivery(id: string): Promise<Shipment> {
  const response = await api.patch<Shipment>(`/shipments/${id}/deliver`);
  return response;
}

/**
 * Criar avaliação da encomenda
 * POST /shipments/reviews
 */
async function createReview(data: CreateShipmentReviewData): Promise<ShipmentReview> {
  const response = await api.post<ShipmentReview>('/shipments/reviews', data);
  return response;
}

/**
 * Buscar avaliação de uma encomenda
 * GET /shipments/:id/review
 */
async function getReviewByShipmentId(shipmentId: string): Promise<ShipmentReview | null> {
  try {
    const response = await api.get<ShipmentReview>(
      `/shipments/${shipmentId}/review`,
    );
    return response;
  } catch (error: any) {
    // Se retornar 404, não tem review ainda
    if (error?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * v2.0 - Confirmar pagamento (upload de comprovante Pix)
 * POST /shipments/:id/confirm-payment
 * Transição: PENDING → PAID
 */
async function confirmPayment(
  id: string,
  data: ConfirmPaymentData,
): Promise<ConfirmPaymentResponse> {
  const response = await api.post<ConfirmPaymentResponse>(
    `/shipments/${id}/confirm-payment`,
    data,
  );
  return response;
}

/**
 * v2.0 - Coletar encomenda (capitão valida QR Code + foto)
 * POST /shipments/:id/collect
 * Transição: PAID → COLLECTED
 */
async function collectShipment(
  id: string,
  data: CollectShipmentData,
): Promise<CollectShipmentResponse> {
  const response = await api.post<CollectShipmentResponse>(
    `/shipments/${id}/collect`,
    data,
  );
  return response;
}

/**
 * v2.0 - Validar entrega (destinatário valida PIN 6 dígitos + foto)
 * POST /shipments/track/:trackingCode/validate-delivery
 * Endpoint público (não requer autenticação)
 * Transição: OUT_FOR_DELIVERY → DELIVERED
 * Credita NavegaCoins ao remetente
 */
async function validateDelivery(
  trackingCode: string,
  data: ValidateDeliveryData,
): Promise<ValidateDeliveryResponse> {
  const response = await api.post<ValidateDeliveryResponse>(
    `/shipments/track/${trackingCode}/validate-delivery`,
    data,
  );
  return response;
}

/**
 * v2.0 - Marcar como "Saiu para Entrega" (capitão)
 * POST /shipments/:id/out-for-delivery
 * Transição: ARRIVED → OUT_FOR_DELIVERY
 */
async function outForDelivery(id: string): Promise<OutForDeliveryResponse> {
  const response = await api.post<OutForDeliveryResponse>(
    `/shipments/${id}/out-for-delivery`,
  );
  return response;
}

/**
 * Reportar incidente na encomenda
 * POST /shipments/:id/incident
 */
async function reportIncident(
  shipmentId: string,
  data: ReportIncidentData,
): Promise<void> {
  await api.post(`/shipments/${shipmentId}/incident`, data);
}

/**
 * Validar QR Code da encomenda
 * POST /shipments/validate-qr
 */
async function validateQR(qrCode: string): Promise<ValidateQRResponse> {
  const response = await api.post<ValidateQRResponse>(
    '/shipments/validate-qr',
    {qrCode},
  );
  return response;
}

/**
 * Deletar encomenda (soft delete)
 * DELETE /shipments/:id
 */
async function deleteShipment(id: string): Promise<void> {
  await api.delete(`/shipments/${id}`);
}

export const shipmentAPI = {
  calculatePrice,
  getPresignedUrls,
  create,
  getMyShipments,
  track,
  getById,
  getTimeline,
  cancel,
  updateStatus,
  confirmDelivery,
  createReview,
  getReviewByShipmentId,
  confirmPayment,
  collectShipment,
  validateDelivery,
  outForDelivery,
  reportIncident,
  validateQR,
  delete: deleteShipment,
};
