export interface Shipment {
  id: string;
  senderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  description: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tripId: string;
  trackingCode: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  photos?: string[];
  qrCode: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipmentData {
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  description: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tripId: string;
  photos?: File[];
}

export interface ReportIncidentData {
  type: string;
  description: string;
  photo?: string;
}

export interface ValidateQRResponse {
  valid: boolean;
  shipment?: Shipment;
}
