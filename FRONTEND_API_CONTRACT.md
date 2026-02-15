# 📱 Frontend API Contract - Sistema de Encomendas

**Versão:** 1.0.0
**Data:** 14 de Fevereiro de 2026
**App:** NavegaJá Mobile (React Native)

Este documento especifica **exatamente** o que o frontend espera do backend.

---

## 📊 Tabela de Conteúdo

1. [Visão Geral](#visão-geral)
2. [Tipos TypeScript](#tipos-typescript)
3. [Endpoints API](#endpoints-api)
4. [Fluxos de Integração](#fluxos-de-integração)
5. [Validações Client-Side](#validações-client-side)
6. [Tratamento de Erros](#tratamento-de-erros)
7. [Comparação com Backend](#comparação-com-backend)

---

## Visão Geral

### O que o Frontend FAZ:

1. ✅ Coleta dados do usuário (formulário)
2. ✅ Valida dados client-side
3. ✅ Solicita presigned URLs do S3
4. ✅ Faz upload direto para S3 (não passa pelo backend)
5. ✅ Envia URLs públicas das fotos no POST /shipments
6. ✅ Exibe encomendas, QR Code, timeline
7. ✅ Permite cancelamento e avaliação
8. ✅ Cache offline com AsyncStorage

### O que o Frontend ESPERA do Backend:

1. ✅ Gerar presigned URLs válidas (5 min)
2. ✅ Calcular preço (peso volumétrico + cupom)
3. ✅ Criar encomenda e retornar tracking code + QR
4. ✅ Listar encomendas do usuário
5. ✅ Fornecer timeline de eventos
6. ✅ Validar e processar cupons
7. ✅ Permitir cancelamento (pending/in_transit)
8. ✅ Processar avaliações

---

## Tipos TypeScript

### 1. ShipmentStatus (Enum)

```typescript
export enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
```

**Uso no frontend:**
- Filtros na lista (Ativas = pending + in_transit)
- Status badge colorido
- Validação de ações (só pode cancelar se pending/in_transit)

---

### 2. Shipment (Interface Principal)

```typescript
export interface Shipment {
  // IDs
  id: string;                        // UUID
  senderId: string;                  // UUID do usuário
  tripId: string;                    // UUID da viagem

  // Rastreamento
  trackingCode: string;              // Ex: "NJ2024000123"
  qrCode: string;                    // QR Code data (string)

  // Destinatário
  recipientName: string;             // Nome completo
  recipientPhone: string;            // Apenas números (11987654321)
  recipientAddress: string;          // Endereço completo

  // Encomenda
  description: string;               // Descrição do conteúdo
  weight: number;                    // Peso em kg (ex: 2.5)
  dimensions?: {                     // Opcional
    length: number;                  // cm
    width: number;                   // cm
    height: number;                  // cm
  };

  // Status e timing
  status: ShipmentStatus;
  createdAt: string;                 // ISO 8601 (ex: "2024-01-01T10:00:00Z")
  updatedAt: string;                 // ISO 8601

  // Financeiro
  price: number;                     // Preço final (após desconto)
  paymentMethod: PaymentMethod;      // "pix" | "cash" | "credit_card" | "debit_card"
  couponCode?: string;               // Código do cupom aplicado (opcional)

  // Mídia
  photos?: string[];                 // URLs públicas S3 (max 5)

  // Relações (populadas pelo backend)
  trip?: {
    id: string;
    origin: string;                  // Ex: "Belém"
    destination: string;             // Ex: "Santarém"
    departureAt: string;             // ISO 8601
    cargoPriceKg: number;            // Preço por kg
  };

  sender?: {
    id: string;
    name: string;
    phone: string;
  };

  deliveryReview?: ShipmentReview;   // Avaliação (se houver)
}
```

---

### 3. CreateShipmentData (Request Body)

```typescript
export interface CreateShipmentData {
  recipientName: string;             // Mín 3 caracteres
  recipientPhone: string;            // 10-11 dígitos (sem formatação)
  recipientAddress: string;          // Mín 10 caracteres
  description: string;               // Mín 5 caracteres
  weight: number;                    // 0.1 - 50 kg
  dimensions?: {                     // Opcional
    length: number;                  // 1 - 200 cm
    width: number;                   // 1 - 200 cm
    height: number;                  // 1 - 200 cm
  };
  tripId: string;                    // UUID da viagem
  paymentMethod: PaymentMethod;
  couponCode?: string;               // Opcional (ex: "FRETE10")
}
```

**Observação:** Fotos NÃO vão no body JSON. Vão como array de URLs no FormData.

---

### 4. CalculateShipmentPriceRequest

```typescript
export interface CalculateShipmentPriceRequest {
  tripId: string;
  weight: number;                    // kg
  dimensions?: {                     // Opcional
    length: number;                  // cm
    width: number;
    height: number;
  };
  couponCode?: string;               // Opcional
}
```

---

### 5. CalculateShipmentPriceResponse

```typescript
export interface CalculateShipmentPriceResponse {
  // Peso
  actualWeight: number;              // Peso real em kg
  volumetricWeight?: number;         // (L × W × H) / 6000
  chargedWeight: number;             // max(actual, volumetric)

  // Preço
  pricePerKg: number;                // trip.cargoPriceKg
  basePrice: number;                 // chargedWeight × pricePerKg
  weightCharge: number;              // Mesmo que basePrice (legacy)

  // Desconto
  couponDiscount?: number;           // Valor do desconto
  couponCode?: string;               // Código aplicado
  totalDiscount: number;             // Total de descontos

  // Final
  finalPrice: number;                // basePrice - totalDiscount

  // Detalhes do cupom (opcional)
  appliedCoupon?: {
    code: string;
    description: string;
    type: 'percentage' | 'fixed';
    value: number;                   // % ou R$
    discount: number;                // Valor calculado do desconto
  };
}
```

**Frontend exibe:**
```
Peso cobrado: 2.5kg (volumétrico: 1.0kg)
Preço base: R$ 37.50
Desconto FRETE10: -R$ 3.75
Total: R$ 33.75 (economize R$ 3.75!)
```

---

### 6. Presigned URLs (S3)

```typescript
export interface GetPresignedUrlsRequest {
  count: number;                     // 1-5
}

export interface GetPresignedUrlsResponse {
  urls: PresignedUrlData[];
  expiresIn: number;                 // Segundos (ex: 300 = 5 min)
}

export interface PresignedUrlData {
  uploadUrl: string;                 // URL para PUT (presigned)
  publicUrl: string;                 // URL pública final
  key: string;                       // Chave S3 (ex: "shipments/2024/uuid.jpg")
}
```

**Exemplo de resposta esperada:**
```json
{
  "urls": [
    {
      "uploadUrl": "https://s3.amazonaws.com/navegaja/shipments/2024/abc123.jpg?X-Amz-Algorithm=...",
      "publicUrl": "https://s3.amazonaws.com/navegaja/shipments/2024/abc123.jpg",
      "key": "shipments/2024/abc123.jpg"
    }
  ],
  "expiresIn": 300
}
```

---

### 7. Timeline

```typescript
export interface ShipmentTimelineEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description: string;               // Ex: "Encomenda criada"
  location?: string;                 // Ex: "Belém - PA" (opcional)
  timestamp: string;                 // ISO 8601
  createdBy?: string;                // UUID do capitão/admin (opcional)
}

export interface TrackShipmentResponse {
  shipment: Shipment;                // Dados completos
  timeline: ShipmentTimelineEvent[]; // Eventos ordenados por timestamp ASC
}
```

---

### 8. Reviews (Avaliações)

```typescript
export interface ShipmentReview {
  id: string;
  shipmentId: string;
  senderId: string;
  rating: number;                    // 1-5 (avaliação geral)
  deliveryQuality: number;           // 1-5 (estado da encomenda)
  timeliness: number;                // 1-5 (pontualidade)
  comment?: string;                  // Opcional
  createdAt: string;                 // ISO 8601
  updatedAt: string;
}

export interface CreateShipmentReviewData {
  shipmentId: string;
  rating: number;                    // Required (1-5)
  deliveryQuality: number;           // Required (1-5)
  timeliness: number;                // Required (1-5)
  comment?: string;                  // Opcional
}
```

---

## Endpoints API

### 1. POST /shipments/upload/presigned-urls

**Request:**
```typescript
{
  count: 3  // Número de fotos (1-5)
}
```

**Response (200):**
```typescript
{
  urls: [
    {
      uploadUrl: "https://s3.amazonaws.com/...",
      publicUrl: "https://s3.amazonaws.com/...",
      key: "shipments/2024/uuid.jpg"
    },
    // ... mais 2 URLs
  ],
  expiresIn: 300
}
```

**Erros:**
- 400: count inválido (< 1 ou > 5)
- 401: Não autenticado
- 500: Erro ao gerar URLs

**Frontend usa:**
```typescript
const {urls} = await shipmentAPI.getPresignedUrls({count: photos.length});
```

---

### 2. POST /shipments/calculate-price

**Request:**
```json
{
  "tripId": "uuid-da-viagem",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 10
  },
  "couponCode": "FRETE10"
}
```

**Response (200):**
```json
{
  "actualWeight": 2.5,
  "volumetricWeight": 1.0,
  "chargedWeight": 2.5,
  "pricePerKg": 15.0,
  "basePrice": 37.5,
  "weightCharge": 37.5,
  "couponDiscount": 3.75,
  "couponCode": "FRETE10",
  "totalDiscount": 3.75,
  "finalPrice": 33.75,
  "appliedCoupon": {
    "code": "FRETE10",
    "description": "10% de desconto no frete",
    "type": "percentage",
    "value": 10,
    "discount": 3.75
  }
}
```

**Erros:**
- 400: Peso inválido, dimensões inválidas
- 404: Viagem não encontrada, cupom não encontrado
- 422: Cupom inválido (expirado, já usado, não aplicável)

**Frontend usa:**
```typescript
// Chama a cada mudança em peso/dimensões/cupom
const priceData = await shipmentAPI.calculatePrice({
  tripId, weight, dimensions, couponCode
});

// Exibe breakdown visual
<ShipmentPriceBreakdown data={priceData} />
```

---

### 3. POST /shipments

**Request (FormData):**
```
Content-Type: multipart/form-data

recipientName: "João da Silva"
recipientPhone: "11987654321"
recipientAddress: "Rua X, 123, Centro"
description: "Documentos importantes"
weight: "2.5"
dimensions: "{\"length\":30,\"width\":20,\"height\":10}"  // JSON stringified
tripId: "uuid-da-viagem"
paymentMethod: "pix"
couponCode: "FRETE10"                                     // Opcional
photos: "https://s3.amazonaws.com/.../photo1.jpg"
photos: "https://s3.amazonaws.com/.../photo2.jpg"
photos: "https://s3.amazonaws.com/.../photo3.jpg"
```

**IMPORTANTE:**
- `photos` são URLs públicas do S3 (não arquivos!)
- Frontend já fez upload S3 antes de chamar este endpoint
- Cada foto é um campo `photos` separado

**Response (201):**
```json
{
  "id": "uuid",
  "senderId": "uuid-usuario",
  "tripId": "uuid-viagem",
  "trackingCode": "NJ2024000123",
  "qrCode": "data-qr-code-string",
  "recipientName": "João da Silva",
  "recipientPhone": "11987654321",
  "recipientAddress": "Rua X, 123, Centro",
  "description": "Documentos importantes",
  "weight": 2.5,
  "dimensions": {
    "length": 30,
    "width": 20,
    "height": 10
  },
  "status": "pending",
  "price": 33.75,
  "paymentMethod": "pix",
  "couponCode": "FRETE10",
  "photos": [
    "https://s3.amazonaws.com/.../photo1.jpg",
    "https://s3.amazonaws.com/.../photo2.jpg",
    "https://s3.amazonaws.com/.../photo3.jpg"
  ],
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z",
  "trip": {
    "id": "uuid",
    "origin": "Belém",
    "destination": "Santarém",
    "departureAt": "2024-01-05T08:00:00Z",
    "cargoPriceKg": 15.0
  }
}
```

**Erros:**
- 400: Validação falhou (peso inválido, dimensões, etc.)
- 404: Viagem não encontrada
- 422: Cupom inválido, viagem já partiu, etc.

**Frontend usa:**
```typescript
// 1. Upload fotos S3
const photoUrls = await uploadPhotosToS3(photos);

// 2. Criar encomenda com URLs
const shipment = await shipmentAPI.create(formData);

// 3. Navegar para detalhes
navigation.replace('ShipmentDetails', {shipmentId: shipment.id});
```

---

### 4. GET /shipments/my-shipments

**Request:** Nenhum body (autenticação via token)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "trackingCode": "NJ2024000123",
    "status": "pending",
    "recipientName": "João da Silva",
    "price": 33.75,
    "weight": 2.5,
    "photos": ["https://..."],
    "createdAt": "2024-01-01T10:00:00Z",
    "trip": {
      "origin": "Belém",
      "destination": "Santarém",
      "departureAt": "2024-01-05T08:00:00Z"
    }
  },
  // ... mais encomendas
]
```

**Ordenação:** createdAt DESC (mais recentes primeiro)

**Frontend usa:**
```typescript
const shipments = await shipmentAPI.getMyShipments();

// Filtrar por status
const active = shipments.filter(s =>
  s.status === 'pending' || s.status === 'in_transit'
);

const completed = shipments.filter(s =>
  s.status === 'delivered' || s.status === 'cancelled'
);
```

---

### 5. GET /shipments/:id

**Request:** `:id` = UUID da encomenda

**Response (200):**
```json
{
  "id": "uuid",
  "senderId": "uuid-usuario",
  "trackingCode": "NJ2024000123",
  "qrCode": "data-qr-code",
  "status": "in_transit",
  "recipientName": "João da Silva",
  "recipientPhone": "11987654321",
  "recipientAddress": "Rua X, 123",
  "description": "Documentos",
  "weight": 2.5,
  "dimensions": {"length": 30, "width": 20, "height": 10},
  "price": 33.75,
  "paymentMethod": "pix",
  "photos": ["https://s3..."],
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-02T08:00:00Z",
  "trip": {
    "id": "uuid",
    "origin": "Belém",
    "destination": "Santarém",
    "departureAt": "2024-01-05T08:00:00Z",
    "cargoPriceKg": 15.0
  },
  "sender": {
    "id": "uuid",
    "name": "Maria Silva",
    "phone": "11999998888"
  },
  "deliveryReview": null
}
```

**Erros:**
- 404: Encomenda não encontrada
- 403: Usuário não tem permissão (não é remetente nem capitão)

**Frontend usa:**
```typescript
const shipment = await shipmentAPI.getById(shipmentId);

// Exibe QR Code
<QRCode value={shipment.qrCode} size={200} />
```

---

### 6. GET /shipments/:id/timeline

**Request:** `:id` = UUID da encomenda

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "shipmentId": "uuid",
    "status": "pending",
    "description": "Encomenda criada",
    "timestamp": "2024-01-01T10:00:00Z"
  },
  {
    "id": "uuid-2",
    "shipmentId": "uuid",
    "status": "in_transit",
    "description": "Embarcou no barco Capitão Silva",
    "location": "Belém - PA",
    "timestamp": "2024-01-05T08:30:00Z",
    "createdBy": "uuid-capitao"
  },
  {
    "id": "uuid-3",
    "shipmentId": "uuid",
    "status": "delivered",
    "description": "Encomenda entregue ao destinatário",
    "location": "Santarém - PA",
    "timestamp": "2024-01-07T14:00:00Z",
    "createdBy": "uuid-capitao"
  }
]
```

**Ordenação:** timestamp ASC (cronológico)

**Frontend exibe:**
```typescript
const timeline = await shipmentAPI.getTimeline(shipmentId);

// Renderiza timeline vertical
timeline.map(event => (
  <TimelineItem
    icon={getIconForStatus(event.status)}
    title={event.description}
    date={format(event.timestamp)}
    location={event.location}
  />
))
```

---

### 7. GET /shipments/track/:trackingCode

**Request:** `:trackingCode` = "NJ2024000123"

**Response (200):**
```json
{
  "shipment": { /* Shipment completo */ },
  "timeline": [ /* Timeline events */ ]
}
```

**Erros:**
- 404: Tracking code não encontrado

**Frontend usa:**
```typescript
// Usuário digita tracking code
const {shipment, timeline} = await shipmentAPI.track(trackingCode);
```

---

### 8. POST /shipments/:id/cancel

**Request:**
```json
{
  "reason": "Mudança de planos"  // Opcional
}
```

**Response (200):** Sem body (204 No Content)

**Erros:**
- 404: Encomenda não encontrada
- 403: Não autorizado
- 422: Não pode cancelar (status = delivered ou cancelled)

**Frontend usa:**
```typescript
await shipmentAPI.cancel(shipmentId, {reason: "Motivo"});

// Mostra toast e volta
toast.showSuccess("Encomenda cancelada!");
navigation.goBack();
```

---

### 9. POST /shipments/reviews

**Request:**
```json
{
  "shipmentId": "uuid",
  "rating": 5,
  "deliveryQuality": 5,
  "timeliness": 4,
  "comment": "Entrega perfeita! Tudo chegou bem."
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "shipmentId": "uuid",
  "senderId": "uuid-usuario",
  "rating": 5,
  "deliveryQuality": 5,
  "timeliness": 4,
  "comment": "Entrega perfeita! Tudo chegou bem.",
  "createdAt": "2024-01-08T10:00:00Z",
  "updatedAt": "2024-01-08T10:00:00Z"
}
```

**Erros:**
- 400: Ratings inválidos (não 1-5)
- 404: Encomenda não encontrada
- 422: Encomenda não foi entregue, já foi avaliada

**Frontend usa:**
```typescript
await shipmentAPI.createReview({
  shipmentId,
  rating: 5,
  deliveryQuality: 5,
  timeliness: 4,
  comment: "Ótimo!"
});

toast.showSuccess("Avaliação enviada!");
```

---

### 10. GET /shipments/:id/review

**Request:** `:id` = UUID da encomenda

**Response (200):**
```json
{
  "id": "uuid",
  "rating": 5,
  "deliveryQuality": 5,
  "timeliness": 4,
  "comment": "Ótimo!",
  "createdAt": "2024-01-08T10:00:00Z"
}
```

**Response (404):** Se não houver avaliação

**Frontend usa:**
```typescript
try {
  const review = await shipmentAPI.getReviewByShipmentId(shipmentId);
  // Exibe avaliação existente
} catch {
  // Não tem avaliação ainda
}
```

---

## Fluxos de Integração

### Fluxo 1: Criar Encomenda

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuário preenche formulário                          │
│    - Destinatário, descrição, peso, dimensões           │
│    - Seleciona 3 fotos (PhotoPicker)                    │
│    - Aplica cupom "FRETE10"                             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Frontend solicita presigned URLs                     │
│    POST /shipments/upload/presigned-urls {count: 3}     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Backend retorna URLs                                 │
│    Response: {urls: [{uploadUrl, publicUrl, key}]}      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. Frontend faz upload DIRETO no S3 (paralelo)          │
│    PUT uploadUrl1 (photo1.jpg)                          │
│    PUT uploadUrl2 (photo2.jpg)                          │
│    PUT uploadUrl3 (photo3.jpg)                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Frontend cria encomenda com URLs públicas            │
│    POST /shipments {                                    │
│      ...dados,                                          │
│      photos: [publicUrl1, publicUrl2, publicUrl3]       │
│    }                                                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Backend cria encomenda e retorna dados completos     │
│    Response: {id, trackingCode, qrCode, ...}            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ 7. Frontend navega para detalhes                        │
│    navigation.replace('ShipmentDetails', {shipmentId})  │
└─────────────────────────────────────────────────────────┘
```

### Fluxo 2: Cálculo de Preço em Tempo Real

```
Usuario digita peso → Frontend chama /calculate-price
                    ↓
                   Backend retorna breakdown
                    ↓
                   Frontend exibe:
                   "Peso cobrado: 2.5kg
                    Preço: R$ 37.50
                    Desconto FRETE10: -R$ 3.75
                    Total: R$ 33.75"
```

### Fluxo 3: Listar e Visualizar Encomendas

```
Usuario abre tab "Encomendas" → GET /my-shipments
                               ↓
                              Backend retorna array
                               ↓
                              Frontend filtra:
                              - Ativas (pending + in_transit)
                              - Concluídas (delivered + cancelled)
                               ↓
                              Usuário clica encomenda
                               ↓
                              GET /shipments/:id
                              GET /shipments/:id/timeline
                               ↓
                              Frontend exibe QR + Timeline
```

---

## Validações Client-Side

**Frontend VALIDA antes de enviar ao backend:**

### Destinatário:
```typescript
recipientName: {
  minLength: 3,
  required: true,
  errorMsg: "Digite o nome completo do destinatário"
}

recipientPhone: {
  pattern: /^\d{10,11}$/,  // 10-11 dígitos
  required: true,
  errorMsg: "Digite um telefone válido com DDD"
}

recipientAddress: {
  minLength: 10,
  required: true,
  errorMsg: "Digite o endereço completo"
}
```

### Encomenda:
```typescript
description: {
  minLength: 5,
  required: true,
  errorMsg: "Descreva o conteúdo (mínimo 5 caracteres)"
}

weight: {
  min: 0.1,
  max: 50,
  required: true,
  errorMsg: "Peso deve estar entre 0.1kg e 50kg"
}

dimensions (se fornecidas): {
  length: { min: 1, max: 200 },
  width: { min: 1, max: 200 },
  height: { min: 1, max: 200 },
  errorMsg: "Dimensões máximas: 200cm"
}
```

### Fotos:
```typescript
photos: {
  maxCount: 5,
  errorMsg: "Máximo 5 fotos"
}
```

**Backend deve validar novamente (nunca confiar no client)!**

---

## Tratamento de Erros

### Erros HTTP que o Frontend TRATA:

| Status | Tipo | Frontend Action |
|--------|------|-----------------|
| 400 | Bad Request | Mostra `Alert.alert('Erro', error.message)` |
| 401 | Unauthorized | Redireciona para Login |
| 403 | Forbidden | Mostra "Você não tem permissão" |
| 404 | Not Found | Mostra "Não encontrado" |
| 422 | Unprocessable Entity | Mostra mensagem específica (cupom inválido, etc.) |
| 500 | Server Error | Mostra "Erro no servidor. Tente novamente." |
| Network | Sem internet | Carrega do cache offline + mostra aviso |

### Formato de Erro Esperado:

```typescript
// Backend deve retornar neste formato:
{
  "error": {
    "message": "Cupom FRETE10 já foi utilizado",
    "code": "COUPON_ALREADY_USED",  // Opcional
    "field": "couponCode"            // Opcional
  }
}
```

**Frontend usa:**
```typescript
try {
  await shipmentAPI.create(data);
} catch (error: any) {
  Alert.alert('Erro', error?.message || 'Erro desconhecido');
}
```

---

## Comparação com Backend

### ✅ Checklist de Compatibilidade

Use esta tabela para verificar se backend está alinhado:

| Feature | Frontend Espera | Backend Deve | Status |
|---------|-----------------|--------------|--------|
| **Presigned URLs** | POST /shipments/upload/presigned-urls | Gerar URLs S3 válidas por 5min | ⏳ |
| **Fotos** | Receber array de URLs públicas | Aceitar photos como URLs (não files) | ⏳ |
| **Tracking Code** | Formato "NJ2024000123" | Gerar com este padrão | ⏳ |
| **QR Code** | String (data) | Gerar QR Code data | ⏳ |
| **Peso Volumétrico** | (L×W×H)/6000 | Calcular corretamente | ⏳ |
| **Cupom** | Desconto % ou fixo | Validar e aplicar | ⏳ |
| **Timeline** | Array ordenado por timestamp ASC | Retornar cronologicamente | ⏳ |
| **Status** | Enum exato (pending, in_transit, etc.) | Usar mesmos valores | ⏳ |
| **Datas** | ISO 8601 com timezone | Retornar formato correto | ⏳ |
| **Erros** | {error: {message}} | Retornar neste formato | ⏳ |

**Marque ✅ quando implementado e testado.**

---

## Resumo das Diferenças Críticas

### ⚠️ ATENÇÃO: Implementação Diferente

1. **Upload de Fotos:**
   - ❌ Backend NÃO recebe arquivos binários
   - ✅ Backend recebe URLs públicas do S3
   - Frontend faz upload direto no S3

2. **FormData:**
   ```
   photos: "https://s3.../photo1.jpg"  ✅ Correto
   photos: File(photo1.jpg)            ❌ Errado
   ```

3. **Peso:**
   ```
   weight: 2.5      ✅ Correto (number)
   weight: "2.5"    ❌ Errado (string no body JSON)

   Mas no FormData:
   weight: "2.5"    ✅ Correto (FormData sempre string)
   ```

4. **Dimensões:**
   ```
   dimensions: "{\"length\":30,...}"  ✅ Correto (JSON stringified no FormData)
   dimensions: {length: 30, ...}      ❌ Errado (objeto não funciona em FormData)
   ```

---

## Endpoints Não Implementados no Frontend

Estes endpoints estão no backend mas **não são usados** pelo frontend atualmente:

- `PATCH /shipments/:id/status` (apenas capitão)
- `POST /shipments/:id/confirm-delivery` (apenas capitão)
- `DELETE /shipments/:id` (não tem UI)

**Podem ser adicionados futuramente se necessário.**

---

## Conclusão

**Frontend está esperando exatamente:**

✅ 10 endpoints REST
✅ Upload S3 com presigned URLs
✅ Cálculo de peso volumétrico
✅ Sistema de cupons
✅ Timeline de eventos
✅ QR Code + Tracking code
✅ Avaliações com 3 ratings

**Backend deve implementar conforme esta especificação para compatibilidade 100%.**

---

**Versão:** 1.0.0
**Última atualização:** 14/02/2026
**Contato:** Time de Desenvolvimento NavegaJá
