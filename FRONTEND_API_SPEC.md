# 📡 API Specification - Frontend NavegaJá (Sistema de Encomendas v2.0)

**Documentação Técnica Completa para Integração Backend**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Tipos e Enums](#tipos-e-enums)
3. [Endpoints REST](#endpoints-rest)
4. [Fluxo de Estados](#fluxo-de-estados)
5. [Upload de Fotos (S3)](#upload-de-fotos-s3)
6. [QR Code & Deep Links](#qr-code--deep-links)
7. [Validações](#validações)
8. [Gamificação (NavegaCoins)](#gamificação-navegacoins)
9. [Notificações](#notificações)
10. [Casos de Uso](#casos-de-uso)

---

## 🎯 Visão Geral

### Base URL
```
Production: https://api.navegaja.com.br/v1
Development: http://localhost:3000/v1
```

### Autenticação
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Exceção:** Endpoints públicos (track, validate-delivery) não requerem autenticação.

---

## 📦 Tipos e Enums

### ShipmentStatus (8 Estados)

```typescript
enum ShipmentStatus {
  PENDING = 'pending',           // Criada, aguardando pagamento
  PAID = 'paid',                 // Pagamento confirmado
  COLLECTED = 'collected',       // Coletada pelo capitão (QR Code)
  IN_TRANSIT = 'in_transit',     // Em trânsito (viagem partiu - AUTO)
  ARRIVED = 'arrived',           // Chegou ao destino (viagem chegou - AUTO)
  OUT_FOR_DELIVERY = 'out_for_delivery', // Saiu para entrega
  DELIVERED = 'delivered',       // Entregue (validado por destinatário)
  CANCELLED = 'cancelled',       // Cancelada
}
```

**Transições Permitidas:**
```
PENDING → PAID (confirmPayment)
PAID → COLLECTED (collectShipment)
COLLECTED → IN_TRANSIT (AUTO - quando trip.status = 'in_transit')
IN_TRANSIT → ARRIVED (AUTO - quando trip.status = 'completed')
ARRIVED → OUT_FOR_DELIVERY (outForDelivery)
OUT_FOR_DELIVERY → DELIVERED (validateDelivery)
PENDING/PAID → CANCELLED (cancel)
```

### PaymentMethod

```typescript
enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH = 'cash',
}
```

### Shipment (Interface Principal)

```typescript
interface Shipment {
  // Identificação
  id: string;                    // UUID
  senderId: string;              // UUID do remetente
  trackingCode: string;          // Ex: "NJ2024000123"

  // Destinatário
  recipientName: string;         // Nome completo
  recipientPhone: string;        // WhatsApp (formato: +55 11 98765-4321)
  recipientAddress: string;      // Endereço completo

  // Encomenda
  description: string;           // Descrição do conteúdo
  weight: number;                // Peso em kg (0.1 - 50kg)
  dimensions?: {                 // Opcional
    length: number;              // cm
    width: number;               // cm
    height: number;              // cm
  };

  // Viagem
  tripId: string;                // UUID da viagem

  // Status & Controle
  status: ShipmentStatus;
  qrCode: string;                // JSON stringified (ver seção QR Code)
  validationCode: string;        // PIN 6 dígitos numéricos

  // Fotos (3 tipos)
  photos?: string[];             // URLs S3 - Fotos da encomenda (criação)
  collectionPhotoUrl?: string;   // URL S3 - Foto no momento da coleta
  deliveryPhotoUrl?: string;     // URL S3 - Foto no momento da entrega

  // Financeiro
  price: number;                 // Valor final em reais
  paymentMethod: PaymentMethod;
  couponCode?: string;           // Código do cupom aplicado (se houver)

  // Timestamps
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
  paidAt?: string;               // ISO 8601
  collectedAt?: string;          // ISO 8601
  deliveredAt?: string;          // ISO 8601

  // Relations (populated)
  trip?: Trip;                   // Incluir quando ?include=trip
  sender?: User;                 // Incluir quando ?include=sender
  deliveryReview?: ShipmentReview; // Incluir quando ?include=review

  // Gamificação v2.0
  navegaCoinsEarned?: number;    // Moedas creditadas após entrega
}
```

### ShipmentReview

```typescript
interface ShipmentReview {
  id: string;
  shipmentId: string;
  senderId: string;
  rating: number;                // 1-5 (geral)
  deliveryQuality: number;       // 1-5
  timeliness: number;            // 1-5 (pontualidade)
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
```

### ShipmentTimelineEvent

```typescript
interface ShipmentTimelineEvent {
  id: string;
  status: ShipmentStatus;
  description: string;           // Ex: "Encomenda coletada pelo capitão"
  location?: string;             // Ex: "Porto de Belém"
  timestamp: string;             // ISO 8601
}
```

---

## 🔌 Endpoints REST

### 1. Calcular Preço

**Objetivo:** Calcular preço ANTES de criar encomenda (usado em CreateShipmentScreen)

```http
POST /shipments/calculate-price
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "tripId": "uuid",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  },
  "couponCode": "FRETE10"
}
```

**Response:** `200 OK`
```json
{
  "basePrice": 50.00,
  "volumetricWeight": 1.5,
  "actualWeight": 2.5,
  "chargedWeight": 2.5,
  "weightCharge": 50.00,
  "pricePerKg": 20.00,
  "couponDiscount": 5.00,
  "totalDiscount": 5.00,
  "finalPrice": 45.00,
  "appliedCoupon": {
    "code": "FRETE10",
    "description": "10% de desconto em fretes",
    "type": "percentage",
    "value": 10,
    "discount": 5.00
  }
}
```

**Cálculo de Peso Volumétrico:**
```javascript
volumetricWeight = (length * width * height) / 6000
chargedWeight = Math.max(actualWeight, volumetricWeight)
basePrice = chargedWeight * trip.cargoPriceKg
```

**Validações:**
- `weight`: 0.1 ≤ weight ≤ 50
- `dimensions`: Cada valor ≤ 200cm
- `tripId`: Deve existir e estar com status 'scheduled'

---

### 2. Obter Presigned URLs (S3)

**Objetivo:** Upload direto no S3 (paralelo, sem passar pelo backend)

```http
POST /shipments/upload/presigned-urls
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "count": 3
}
```

**Response:** `200 OK`
```json
{
  "urls": [
    {
      "uploadUrl": "https://s3.amazonaws.com/navegaja-shipments/...",
      "publicUrl": "https://navegaja-shipments.s3.amazonaws.com/...",
      "key": "shipments/uuid/photo1.jpg"
    },
    {
      "uploadUrl": "https://s3.amazonaws.com/navegaja-shipments/...",
      "publicUrl": "https://navegaja-shipments.s3.amazonaws.com/...",
      "key": "shipments/uuid/photo2.jpg"
    }
  ],
  "expiresIn": 300
}
```

**Frontend faz:**
```javascript
// 1. Obter presigned URLs
const {urls} = await POST /upload/presigned-urls { count: 3 }

// 2. Upload DIRETO no S3 (paralelo)
await Promise.all(urls.map(async (url, index) => {
  const blob = await fetch(photo.uri).then(r => r.blob())
  await fetch(url.uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: {'Content-Type': 'image/jpeg'}
  })
}))

// 3. Usar publicUrl no POST /shipments
photos: urls.map(u => u.publicUrl)
```

**Validações:**
- `count`: 1 ≤ count ≤ 5
- S3 bucket deve ter CORS habilitado
- Presigned URL expira em 5 minutos

---

### 3. Criar Encomenda

**Objetivo:** Criar nova encomenda (já com fotos no S3)

```http
POST /shipments
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "recipientName": "João Silva",
  "recipientPhone": "+55 91 98765-4321",
  "recipientAddress": "Rua das Flores, 123 - Centro, Santarém - PA",
  "description": "Documentos e livros",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  },
  "tripId": "uuid-da-viagem",
  "paymentMethod": "pix",
  "couponCode": "FRETE10",
  "photos": [
    "https://s3.../photo1.jpg",
    "https://s3.../photo2.jpg"
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "senderId": "uuid-usuario-logado",
  "recipientName": "João Silva",
  "recipientPhone": "+55 91 98765-4321",
  "recipientAddress": "Rua das Flores, 123 - Centro, Santarém - PA",
  "description": "Documentos e livros",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 15
  },
  "tripId": "uuid-da-viagem",
  "trackingCode": "NJ2024000123",
  "status": "pending",
  "photos": [
    "https://s3.../photo1.jpg",
    "https://s3.../photo2.jpg"
  ],
  "qrCode": "{\"shipmentId\":\"uuid\",\"trackingCode\":\"NJ2024000123\"}",
  "validationCode": "123456",
  "price": 45.00,
  "paymentMethod": "pix",
  "couponCode": "FRETE10",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Backend deve:**
1. Gerar `trackingCode` único: `NJ{YEAR}{SEQUENCE}` (ex: NJ2024000123)
2. Gerar `validationCode`: 6 dígitos aleatórios (123456)
3. Gerar `qrCode`: JSON stringified com shipmentId e trackingCode
4. Calcular preço com base em weight/dimensions/trip.cargoPriceKg/coupon
5. Criar timeline event: "Encomenda criada"
6. Status inicial: `pending`

**Validações:**
- Telefone: Formato WhatsApp válido
- Peso: 0.1 ≤ weight ≤ 50
- Trip: Deve existir, status 'scheduled', departure > now + 2h
- Photos: Máx 5, URLs S3 válidas

---

### 4. Confirmar Pagamento (v2.0)

**Objetivo:** Usuário confirma pagamento PIX (upload comprovante opcional)

```http
POST /shipments/:id/confirm-payment
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "paymentProof": "https://s3.../comprovante.jpg"
}
```

**Response:** `200 OK`
```json
{
  "shipment": {
    "id": "uuid",
    "status": "paid",
    "paidAt": "2024-01-15T11:00:00Z",
    ...
  },
  "message": "Pagamento confirmado com sucesso!"
}
```

**Backend deve:**
1. Validar: status atual = 'pending'
2. Atualizar: status → 'paid', paidAt = now
3. Criar timeline event: "Pagamento confirmado"
4. Enviar notificação push ao capitão da viagem

**Transição:** `PENDING → PAID`

---

### 5. Coletar Encomenda (v2.0 - Capitão)

**Objetivo:** Capitão coleta encomenda (via QR Code scanner)

```http
POST /shipments/:id/collect
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "collectionPhoto": "https://s3.../collection.jpg"
}
```

**Response:** `200 OK`
```json
{
  "shipment": {
    "id": "uuid",
    "status": "collected",
    "collectionPhotoUrl": "https://s3.../collection.jpg",
    "collectedAt": "2024-01-15T12:00:00Z",
    ...
  },
  "message": "Encomenda coletada com sucesso!"
}
```

**Backend deve:**
1. Validar: status atual = 'paid'
2. Validar: user é capitão da viagem (trip.captainId = userId)
3. Atualizar: status → 'collected', collectedAt = now
4. Criar timeline event: "Encomenda coletada pelo capitão"
5. Enviar notificação push ao remetente

**Transição:** `PAID → COLLECTED`

---

### 6. Auto-Update: IN_TRANSIT (Backend)

**Trigger:** Trip status muda para 'in_transit' (viagem partiu)

**Backend deve:**
```sql
UPDATE shipments
SET status = 'in_transit', updated_at = NOW()
WHERE trip_id = {tripId}
  AND status = 'collected'
```

**Timeline event:** "Encomenda em trânsito - Viagem partiu"

**Transição:** `COLLECTED → IN_TRANSIT` (AUTOMÁTICO)

---

### 7. Auto-Update: ARRIVED (Backend)

**Trigger:** Trip status muda para 'completed' (viagem chegou)

**Backend deve:**
```sql
UPDATE shipments
SET status = 'arrived', updated_at = NOW()
WHERE trip_id = {tripId}
  AND status = 'in_transit'
```

**Timeline event:** "Encomenda chegou ao destino"

**Enviar WhatsApp ao destinatário:**
```
Olá {recipientName}! Sua encomenda chegou.
Código: {trackingCode}
Retire com o capitão no porto.

Rastrear: https://navegaja.com.br/track/{trackingCode}
```

**Transição:** `IN_TRANSIT → ARRIVED` (AUTOMÁTICO)

---

### 8. Marcar Saiu para Entrega (v2.0 - Capitão)

**Objetivo:** Capitão marca que saiu para entregar

```http
POST /shipments/:id/out-for-delivery
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:** (vazio)
```json
{}
```

**Response:** `200 OK`
```json
{
  "shipment": {
    "id": "uuid",
    "status": "out_for_delivery",
    "validationCode": "123456",
    ...
  },
  "message": "Encomenda marcada como saiu para entrega"
}
```

**Backend deve:**
1. Validar: status atual = 'arrived'
2. Validar: user é capitão da viagem
3. Atualizar: status → 'out_for_delivery'
4. Criar timeline event: "Saiu para entrega"
5. Enviar notificação push ao remetente
6. Enviar WhatsApp ao destinatário com PIN

**Transição:** `ARRIVED → OUT_FOR_DELIVERY`

---

### 9. Validar Entrega (v2.0 - Destinatário) ⭐ PÚBLICO

**Objetivo:** Destinatário valida recebimento com PIN

```http
POST /shipments/track/:trackingCode/validate-delivery
Content-Type: application/json
```

**⚠️ ENDPOINT PÚBLICO (sem autenticação)**

**Request Body:**
```json
{
  "validationCode": "123456",
  "deliveryPhoto": "https://s3.../delivery.jpg"
}
```

**Response:** `200 OK`
```json
{
  "shipment": {
    "id": "uuid",
    "status": "delivered",
    "deliveryPhotoUrl": "https://s3.../delivery.jpg",
    "deliveredAt": "2024-01-15T15:00:00Z",
    "navegaCoinsEarned": 10,
    ...
  },
  "message": "Entrega confirmada com sucesso!",
  "navegaCoinsEarned": 10
}
```

**Backend deve:**
1. Buscar shipment por trackingCode
2. Validar: status atual = 'out_for_delivery'
3. Validar: validationCode corresponde
4. Atualizar: status → 'delivered', deliveredAt = now
5. **CREDITAR NavegaCoins ao remetente** (ver seção Gamificação)
6. Criar timeline event: "Entrega confirmada pelo destinatário"
7. Enviar notificação push ao remetente

**Validações:**
- trackingCode: Deve existir
- validationCode: Deve ser exatamente 6 dígitos
- validationCode: Deve corresponder ao shipment.validationCode

**Transição:** `OUT_FOR_DELIVERY → DELIVERED`

---

### 10. Listar Minhas Encomendas

```http
GET /shipments/my-shipments?status=active&page=1&limit=20
Authorization: Bearer {token}
```

**Query Params:**
- `status`: 'active' | 'completed' (optional)
  - active: pending, paid, collected, in_transit, arrived, out_for_delivery
  - completed: delivered, cancelled
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "shipments": [
    {
      "id": "uuid",
      "trackingCode": "NJ2024000123",
      "status": "in_transit",
      "recipientName": "João Silva",
      "weight": 2.5,
      "price": 45.00,
      "createdAt": "2024-01-15T10:30:00Z",
      "trip": {
        "id": "uuid",
        "departure": "Belém",
        "destination": "Santarém",
        "departureTime": "2024-01-16T08:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 11. Rastrear Encomenda ⭐ PÚBLICO

```http
GET /shipments/track/:trackingCode
```

**⚠️ ENDPOINT PÚBLICO (sem autenticação)**

**Response:** `200 OK`
```json
{
  "shipment": {
    "id": "uuid",
    "trackingCode": "NJ2024000123",
    "status": "in_transit",
    "recipientName": "João S.",
    "weight": 2.5,
    "createdAt": "2024-01-15T10:30:00Z",
    "trip": {
      "departure": "Belém",
      "destination": "Santarém",
      "departureTime": "2024-01-16T08:00:00Z",
      "estimatedArrival": "2024-01-16T14:00:00Z"
    }
  },
  "timeline": [
    {
      "id": "uuid1",
      "status": "pending",
      "description": "Encomenda criada",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid2",
      "status": "paid",
      "description": "Pagamento confirmado",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    {
      "id": "uuid3",
      "status": "collected",
      "description": "Encomenda coletada pelo capitão",
      "location": "Porto de Belém",
      "timestamp": "2024-01-15T12:00:00Z"
    },
    {
      "id": "uuid4",
      "status": "in_transit",
      "description": "Encomenda em trânsito - Viagem partiu",
      "location": "Rio Amazonas",
      "timestamp": "2024-01-16T08:00:00Z"
    }
  ]
}
```

**Dados sensíveis ocultados:**
- recipientName: Apenas inicial (João S.)
- recipientPhone: Não retornado
- recipientAddress: Não retornado

---

### 12. Cancelar Encomenda

```http
POST /shipments/:id/cancel
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "Mudança de planos"
}
```

**Response:** `200 OK`
```json
{
  "message": "Encomenda cancelada com sucesso"
}
```

**Validações:**
- Apenas remetente pode cancelar
- Status permitidos: pending, paid
- Após 'collected' não pode mais cancelar

**Backend deve:**
1. Validar: senderId = userId
2. Validar: status IN ('pending', 'paid')
3. Atualizar: status → 'cancelled'
4. Criar timeline event
5. Se status = 'paid': processar reembolso
6. Notificar capitão se já estava paid

---

### 13. Criar Avaliação

```http
POST /shipments/reviews
Content-Type: application/json
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "shipmentId": "uuid",
  "rating": 5,
  "deliveryQuality": 5,
  "timeliness": 4,
  "comment": "Entrega rápida e segura!"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "shipmentId": "uuid",
  "senderId": "uuid",
  "rating": 5,
  "deliveryQuality": 5,
  "timeliness": 4,
  "comment": "Entrega rápida e segura!",
  "createdAt": "2024-01-15T16:00:00Z"
}
```

**Validações:**
- Apenas remetente pode avaliar
- Shipment status = 'delivered'
- Cada shipment pode ter apenas 1 avaliação
- rating, deliveryQuality, timeliness: 1-5

---

### 14. Buscar Detalhes

```http
GET /shipments/:id?include=trip,sender,review
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "trackingCode": "NJ2024000123",
  "status": "delivered",
  ...,
  "trip": {
    "id": "uuid",
    "departure": "Belém",
    "destination": "Santarém",
    ...
  },
  "sender": {
    "id": "uuid",
    "name": "Maria Santos",
    "phone": "+55 91 99999-9999"
  },
  "deliveryReview": {
    "rating": 5,
    "comment": "Ótima entrega!",
    ...
  }
}
```

---

## 🔄 Fluxo de Estados

### Diagrama de Estados

```
┌─────────┐
│ PENDING │ ← Criada
└────┬────┘
     │ confirmPayment()
     ▼
┌─────────┐
│  PAID   │ ← Pagamento confirmado
└────┬────┘
     │ collectShipment()
     ▼
┌──────────┐
│COLLECTED │ ← Coletada pelo capitão
└────┬─────┘
     │ AUTO (trip starts)
     ▼
┌────────────┐
│ IN_TRANSIT │ ← Viagem em andamento
└────┬───────┘
     │ AUTO (trip completes)
     ▼
┌─────────┐
│ ARRIVED │ ← Chegou ao destino
└────┬────┘
     │ outForDelivery()
     ▼
┌──────────────────┐
│OUT_FOR_DELIVERY │ ← Capitão saiu para entregar
└────┬─────────────┘
     │ validateDelivery()
     ▼
┌───────────┐
│ DELIVERED │ ← Entregue e validado
└───────────┘

   ┌─────────┐
   │CANCELLED│ ← Cancelada (apenas PENDING/PAID)
   └─────────┘
```

### Responsáveis por Cada Transição

| Transição | Quem | Método |
|-----------|------|--------|
| PENDING → PAID | Usuário | confirmPayment() |
| PAID → COLLECTED | Capitão | collectShipment() |
| COLLECTED → IN_TRANSIT | Sistema (auto) | Trip started |
| IN_TRANSIT → ARRIVED | Sistema (auto) | Trip completed |
| ARRIVED → OUT_FOR_DELIVERY | Capitão | outForDelivery() |
| OUT_FOR_DELIVERY → DELIVERED | Destinatário | validateDelivery() |
| PENDING/PAID → CANCELLED | Usuário | cancel() |

---

## 📸 Upload de Fotos (S3)

### Estratégia: Presigned URLs

**Vantagens:**
- Upload paralelo (mais rápido)
- Não sobrecarrega backend
- Escalável
- Seguro (URLs expiram)

### Fluxo Completo

```javascript
// 1. Frontend solicita presigned URLs
POST /shipments/upload/presigned-urls
{
  "count": 3
}

// Response
{
  "urls": [
    {
      "uploadUrl": "https://s3.../presigned-url-1",
      "publicUrl": "https://s3.../photo1.jpg",
      "key": "shipments/uuid/photo1.jpg"
    }
  ],
  "expiresIn": 300
}

// 2. Frontend faz upload DIRETO no S3 (paralelo)
await Promise.all(urls.map(async (presigned, i) => {
  const photo = photos[i]
  const blob = await fetch(photo.uri).then(r => r.blob())

  await fetch(presigned.uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': 'image/jpeg'
    }
  })
}))

// 3. Frontend cria shipment com publicUrls
POST /shipments
{
  ...,
  "photos": [
    "https://s3.../photo1.jpg",
    "https://s3.../photo2.jpg"
  ]
}
```

### Backend S3 Configuration

```javascript
// Gerar presigned URL
const s3 = new AWS.S3()
const key = `shipments/${uuid()}/${Date.now()}.jpg`

const uploadUrl = s3.getSignedUrl('putObject', {
  Bucket: 'navegaja-shipments',
  Key: key,
  ContentType: 'image/jpeg',
  Expires: 300 // 5 minutos
})

const publicUrl = `https://navegaja-shipments.s3.amazonaws.com/${key}`
```

### CORS S3 Bucket

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Resize no Frontend

```javascript
// react-native-image-picker já redimensiona
const options = {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1920
}
```

---

## 🔐 QR Code & Deep Links

### QR Code Format

**Gerado pelo Backend ao criar shipment:**

```json
{
  "shipmentId": "uuid-da-encomenda",
  "trackingCode": "NJ2024000123"
}
```

**Stringified:**
```javascript
qrCode = JSON.stringify({
  shipmentId: "123e4567-e89b-12d3-a456-426614174000",
  trackingCode: "NJ2024000123"
})
```

**Frontend escaneia e faz:**
```javascript
const data = JSON.parse(qrCodeValue)
POST /shipments/${data.shipmentId}/collect
```

### Deep Link

**URL Schema:** `navegaja://shipment/validate`

**Exemplo completo:**
```
navegaja://shipment/validate?trackingCode=NJ2024000123&pin=123456
```

**Quando usar:**
- WhatsApp notification ao destinatário
- SMS notification
- Link de rastreamento

**Frontend abre automaticamente:**
```javascript
// App detecta deep link
// Navega para ValidateDeliveryScreen
// Preenche campos automaticamente
navigation.navigate('ValidateDelivery', {
  trackingCode: 'NJ2024000123',
  pin: '123456'
})
```

---

## ✅ Validações

### Criar Encomenda

```javascript
// Peso
weight >= 0.1 && weight <= 50

// Dimensões (se fornecidas)
length <= 200 && width <= 200 && height <= 200

// Telefone destinatário
/^\+55 \d{2} \d{4,5}-\d{4}$/.test(recipientPhone)

// Trip
trip.status === 'scheduled'
trip.departureTime > now + 2 horas

// Fotos
photos.length <= 5
photos.every(url => url.startsWith('https://navegaja-shipments.s3'))
```

### Validar Entrega

```javascript
// PIN
validationCode.length === 6
/^\d{6}$/.test(validationCode)
validationCode === shipment.validationCode
```

### Coletar Encomenda

```javascript
// Permissão
user.id === trip.captainId

// Status
shipment.status === 'paid'
```

---

## 🎮 Gamificação (NavegaCoins)

### Regras de Ganho

**Ao entregar encomenda (validateDelivery):**

```javascript
// Cálculo base
const baseCoins = Math.floor(shipment.price / 10)

// Multiplicadores
let multiplier = 1.0

// +20% se entrega rápida (< 70% do tempo estimado)
const estimatedDuration = trip.estimatedDuration
const actualDuration = deliveredAt - trip.departureTime
if (actualDuration < estimatedDuration * 0.7) {
  multiplier += 0.2
}

// +10% se primeira encomenda do mês
if (isFirstShipmentOfMonth(senderId)) {
  multiplier += 0.1
}

// Total
const navegaCoinsEarned = Math.floor(baseCoins * multiplier)
```

**Exemplo:**
```
Encomenda: R$ 45.00
Base: 45 / 10 = 4 coins
Multiplicador: 1.0
Total: 4 NavegaCoins
```

### Creditar Coins

```sql
-- Ao validar entrega
UPDATE users
SET navega_coins = navega_coins + {navegaCoinsEarned}
WHERE id = {senderId}

-- Registrar histórico
INSERT INTO coin_transactions (user_id, amount, type, reference_id)
VALUES ({senderId}, {coins}, 'shipment_delivered', {shipmentId})
```

---

## 🔔 Notificações

### Push Notifications (Firebase)

**Título:** NavegaJá
**Icon:** ic_notification

#### 1. Pagamento Confirmado
```javascript
{
  title: "Pagamento Confirmado",
  body: "Sua encomenda #NJ2024000123 foi confirmada!",
  data: {
    type: "shipment_paid",
    shipmentId: "uuid"
  },
  to: [captainId]
}
```

#### 2. Encomenda Coletada
```javascript
{
  title: "Encomenda Coletada",
  body: "O capitão coletou sua encomenda #NJ2024000123",
  data: {
    type: "shipment_collected",
    shipmentId: "uuid"
  },
  to: [senderId]
}
```

#### 3. Encomenda Chegou
```javascript
{
  title: "Encomenda Chegou! 🎉",
  body: "Sua encomenda #NJ2024000123 chegou ao destino",
  data: {
    type: "shipment_arrived",
    shipmentId: "uuid"
  },
  to: [senderId]
}
```

#### 4. Saiu para Entrega
```javascript
{
  title: "Saiu para Entrega",
  body: "O capitão saiu para entregar #NJ2024000123",
  data: {
    type: "shipment_out_for_delivery",
    shipmentId: "uuid"
  },
  to: [senderId]
}
```

#### 5. Entrega Confirmada
```javascript
{
  title: "Entrega Confirmada! 🎉",
  body: "Você ganhou {coins} NavegaCoins!",
  data: {
    type: "shipment_delivered",
    shipmentId: "uuid",
    navegaCoinsEarned: 10
  },
  to: [senderId]
}
```

### WhatsApp Notifications (Twilio)

#### 1. Encomenda Chegou (Destinatário)
```
Olá {recipientName}!

Sua encomenda chegou ao porto de {destination}.

📦 Código: {trackingCode}
🚢 Capitão: {captainName}
📱 Telefone: {captainPhone}

Retire sua encomenda ou aguarde a entrega.

Rastrear: https://navegaja.com.br/track/{trackingCode}
```

#### 2. Saiu para Entrega (Destinatário)
```
Olá {recipientName}!

O capitão está a caminho para entregar sua encomenda.

📦 Código: {trackingCode}
🔑 PIN de validação: {validationCode}

Quando receber, confirme com o PIN acima.

Validar: navegaja://shipment/validate?trackingCode={trackingCode}&pin={validationCode}
```

---

## 🎯 Casos de Uso

### 1. Criar Encomenda Completo

```javascript
// Frontend
async function criarEncomenda() {
  // 1. Usuário seleciona fotos
  const photos = await PhotoPicker.selectPhotos()

  // 2. Obter presigned URLs
  const {urls} = await POST('/shipments/upload/presigned-urls', {
    count: photos.length
  })

  // 3. Upload paralelo no S3
  await Promise.all(photos.map((photo, i) =>
    uploadToS3(photo, urls[i].uploadUrl)
  ))

  // 4. Criar shipment
  const shipment = await POST('/shipments', {
    recipientName: "João Silva",
    recipientPhone: "+55 91 98765-4321",
    recipientAddress: "Rua das Flores, 123",
    description: "Documentos",
    weight: 2.5,
    tripId: "uuid",
    paymentMethod: "pix",
    photos: urls.map(u => u.publicUrl)
  })

  // 5. Navegar para detalhes
  navigation.navigate('ShipmentDetails', {
    shipmentId: shipment.id
  })
}
```

### 2. Capitão Coleta via QR Code

```javascript
// Frontend - ScanShipmentQRScreen
async function onQRCodeScanned(qrValue) {
  // Parse QR Code
  const {shipmentId, trackingCode} = JSON.parse(qrValue)

  // Confirmar
  Alert.alert(
    'Coletar Encomenda',
    `Código: ${trackingCode}`,
    [
      {text: 'Cancelar'},
      {
        text: 'Coletar',
        onPress: async () => {
          // Opcional: tirar foto
          const photo = await Camera.takePicture()

          // Upload foto
          const {urls} = await POST('/upload/presigned-urls', {count: 1})
          await uploadToS3(photo, urls[0].uploadUrl)

          // Coletar
          await POST(`/shipments/${shipmentId}/collect`, {
            collectionPhoto: urls[0].publicUrl
          })

          toast.success('Encomenda coletada!')
        }
      }
    ]
  )
}
```

### 3. Destinatário Valida Entrega

```javascript
// Frontend - ValidateDeliveryScreen
async function validateDelivery() {
  const response = await POST(
    `/shipments/track/${trackingCode}/validate-delivery`,
    {
      validationCode: pin,
      deliveryPhoto: photoUrl // opcional
    }
  )

  // Mostrar NavegaCoins ganhos
  Alert.alert(
    'Entrega Confirmada! ✅',
    `O remetente ganhou ${response.navegaCoinsEarned} NavegaCoins! 🎉`
  )
}
```

---

## 🔧 Error Handling

### Códigos de Erro Esperados

```javascript
// 400 Bad Request
{
  "error": "INVALID_WEIGHT",
  "message": "Peso deve estar entre 0.1kg e 50kg"
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Token inválido ou expirado"
}

// 403 Forbidden
{
  "error": "FORBIDDEN",
  "message": "Apenas o capitão pode coletar esta encomenda"
}

// 404 Not Found
{
  "error": "SHIPMENT_NOT_FOUND",
  "message": "Encomenda não encontrada"
}

// 409 Conflict
{
  "error": "INVALID_STATUS_TRANSITION",
  "message": "Não é possível coletar uma encomenda com status 'pending'"
}

// 422 Unprocessable Entity
{
  "error": "INVALID_VALIDATION_CODE",
  "message": "PIN incorreto"
}
```

---

## 📊 Resumo dos Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | /shipments/calculate-price | ✅ | Calcular preço |
| POST | /shipments/upload/presigned-urls | ✅ | Obter URLs S3 |
| POST | /shipments | ✅ | Criar encomenda |
| POST | /shipments/:id/confirm-payment | ✅ | Confirmar pagamento |
| POST | /shipments/:id/collect | ✅ | Coletar (capitão) |
| POST | /shipments/:id/out-for-delivery | ✅ | Marcar saiu |
| POST | /shipments/track/:code/validate-delivery | ❌ | Validar entrega (público) |
| GET | /shipments/my-shipments | ✅ | Listar minhas |
| GET | /shipments/track/:code | ❌ | Rastrear (público) |
| GET | /shipments/:id | ✅ | Detalhes |
| POST | /shipments/:id/cancel | ✅ | Cancelar |
| POST | /shipments/reviews | ✅ | Criar avaliação |

**Total:** 14 endpoints (2 públicos, 12 autenticados)

---

## ✅ Checklist de Implementação Backend

- [ ] Database schema (shipments, timeline, reviews)
- [ ] 14 endpoints REST
- [ ] S3 presigned URLs
- [ ] Tracking code generator (NJ{YEAR}{SEQ})
- [ ] PIN generator (6 dígitos)
- [ ] QR Code generator (JSON)
- [ ] Cálculo de peso volumétrico
- [ ] Sistema de cupons integrado
- [ ] Auto-update (IN_TRANSIT, ARRIVED)
- [ ] NavegaCoins calculation & credit
- [ ] Push notifications (Firebase)
- [ ] WhatsApp notifications (Twilio)
- [ ] Validações de negócio
- [ ] Timeline events
- [ ] CORS S3 bucket

---

**Documentação gerada pelo Frontend NavegaJá v2.0**
**Data:** 2024-01-15
**Versão:** 2.0.0
