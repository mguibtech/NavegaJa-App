# 📦 Guia de Setup - Sistema de Encomendas

Instruções completas para configurar o sistema de encomendas no app mobile NavegaJá.

---

## 🎯 Visão Geral

O sistema de encomendas permite:
- ✅ Criar encomendas com até 5 fotos
- ✅ Upload direto para AWS S3 (escalável)
- ✅ Rastreamento com QR Code
- ✅ Timeline de status (pending → in_transit → delivered)
- ✅ Sistema de avaliações
- ✅ Cálculo de preço baseado em peso volumétrico

---

## 📋 Pré-requisitos

### Backend
- ✅ Endpoints implementados (POST /shipments, GET /my-shipments, etc.)
- ✅ AWS S3 configurado (ou local storage para dev)
- ⚠️ Variáveis de ambiente configuradas (ver abaixo)

### Frontend
- ✅ React Native 0.83.1
- ✅ TypeScript 5.8.3
- ⚠️ react-native-image-picker (instalar - ver passo 1)
- ✅ react-native-qrcode-svg (já instalado)

---

## 🚀 Setup Passo a Passo

### Passo 1: Instalar dependência de fotos

```bash
yarn add react-native-image-picker
```

### Passo 2: Configurar permissões nativas

#### iOS (ios/navegaJaAPP/Info.plist)

Adicione:

```xml
<key>NSCameraUsageDescription</key>
<string>Precisamos de acesso à câmera para você tirar fotos das encomendas</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos de acesso à galeria para você selecionar fotos</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Precisamos de permissão para salvar fotos</string>
```

Depois:

```bash
cd ios && pod install && cd ..
```

#### Android (android/app/src/main/AndroidManifest.xml)

Adicione antes de `<application>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
```

### Passo 3: Descomentar código do PhotoPicker

Arquivo: `src/components/PhotoPicker/PhotoPicker.tsx`

**Adicionar no topo:**
```typescript
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
```

**Descomentar:**
- Função `openCamera()` → linhas 42-74
- Função `openGallery()` → linhas 89-121

### Passo 4: Rebuild do app

```bash
# iOS
yarn ios

# Android
yarn android
```

---

## ☁️ Configuração S3 (Backend)

### Variáveis de Ambiente (.env)

```bash
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=navegaja-shipments

# Fallback local (desenvolvimento sem S3)
UPLOAD_FALLBACK=local
LOCAL_UPLOAD_PATH=./uploads/shipments
```

### Custos Estimados (AWS S3)

**Para 10.000 encomendas/mês com 3 fotos cada:**
- Storage: 30.000 fotos × 500KB = 15GB → **$0.35/mês**
- PUT requests: 30.000 × $0.005/1000 → **$0.15**
- GET requests: 90.000 × $0.0004/1000 → **$0.04**

**Total: ~$0.54/mês** ✅ Muito barato!

### Alternativas ao S3

Se não quiser usar AWS S3:

1. **Cloudinary** (https://cloudinary.com)
   - Free tier: 25GB storage + 25GB bandwidth
   - Mais fácil de configurar
   - Upload direto do app

2. **DigitalOcean Spaces** (https://www.digitalocean.com/products/spaces)
   - $5/mês fixo (250GB storage + 1TB transfer)
   - API compatível com S3

3. **Local Storage** (desenvolvimento)
   - Define `UPLOAD_FALLBACK=local` no .env
   - Fotos salvas em `./uploads/shipments`

---

## 🔄 Fluxo de Upload

### 1️⃣ Usuário seleciona fotos
```typescript
// PhotoPicker component
<PhotoPicker
  photos={photos}
  onPhotosChange={setPhotos}
  maxPhotos={5}
/>
```

### 2️⃣ App solicita presigned URLs
```typescript
// shipmentService.ts → uploadPhotosToS3()
const {urls} = await shipmentAPI.getPresignedUrls({count: 3});
// Retorna: [
//   {uploadUrl: "s3-presigned-url", publicUrl: "https://..."},
//   ...
// ]
```

### 3️⃣ Upload direto no S3 (paralelo)
```typescript
await Promise.all(
  photos.map((photo, i) =>
    fetch(urls[i].uploadUrl, {
      method: 'PUT',
      body: photoBlob,
      headers: {'Content-Type': 'image/jpeg'}
    })
  )
);
```

### 4️⃣ Criar encomenda com URLs públicas
```typescript
await shipmentAPI.create({
  ...formData,
  photos: urls.map(u => u.publicUrl)  // URLs públicas
});
```

---

## 🧪 Testando

### 1. Criar encomenda (desenvolvimento)

```bash
# Backend (se S3 não configurado)
UPLOAD_FALLBACK=local npm run start:dev
```

```typescript
// App
navigation.navigate('CreateShipment', {tripId: 'uuid-da-viagem'});

// Preencher:
// - Destinatário (nome, telefone, endereço)
// - Descrição, peso (ex: 2.5kg)
// - Selecionar 2-3 fotos
// - Aplicar cupom (opcional): FRETE10
// - Clicar "Pagar R$ X"
```

### 2. Ver lista de encomendas

```typescript
// Tab "Encomendas" no bottom navigator
// Tabs: Ativas | Concluídas
```

### 3. Ver detalhes + QR Code

```typescript
// Clicar em uma encomenda
// Ver: QR Code, status, timeline, fotos
```

### 4. Cancelar encomenda

```typescript
// ShipmentDetailsScreen → Botão "Cancelar Encomenda"
// Só funciona se status = pending ou in_transit
```

### 5. Avaliar entrega

```typescript
// ShipmentDetailsScreen (status = delivered)
// → Botão "Avaliar Entrega"
// → 3 ratings (geral, qualidade, pontualidade) + comentário
```

---

## 🐛 Troubleshooting

### Erro: "Module not found: react-native-image-picker"

```bash
# Instalar
yarn add react-native-image-picker

# iOS
cd ios && pod install && cd ..
yarn ios

# Android
yarn android
```

### Erro: "Camera permission denied"

**iOS:** Verifique `Info.plist` → deve ter `NSCameraUsageDescription`

**Android:** Verifique `AndroidManifest.xml` → deve ter `<uses-permission android:name="android.permission.CAMERA" />`

### Erro: "Upload failed to S3"

```bash
# Verifique backend
# .env deve ter:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=us-east-1

# Ou use fallback local:
UPLOAD_FALLBACK=local
```

### Fotos aparecem rotacionadas (iOS)

✅ react-native-image-picker já corrige automaticamente usando EXIF metadata.

### Upload muito lento

- Verifique conexão de internet
- Fotos são resize automático para 1920x1920 (qualidade 0.8)
- Upload é paralelo (todas as fotos ao mesmo tempo)

---

## 📱 Telas Implementadas

### 1. CreateShipmentScreen
- ✅ Formulário completo
- ✅ PhotoPicker integrado
- ✅ Cálculo de preço em tempo real
- ✅ Input de cupom (CouponInputV2)
- ✅ Seleção de método de pagamento (PIX/Dinheiro)
- ✅ Validações client-side

**Navegação:**
```typescript
TripDetailsScreen → [Enviar Encomenda] → CreateShipmentScreen
```

### 2. ShipmentsScreen
- ✅ Lista com tabs (Ativas | Concluídas)
- ✅ Pull to refresh
- ✅ Empty states
- ✅ FAB (Floating Action Button)

**Navegação:**
```typescript
Tab "Encomendas" (bottom navigator)
```

### 3. ShipmentDetailsScreen
- ✅ QR Code gerado
- ✅ Status badge colorido
- ✅ Timeline de eventos
- ✅ Dados do destinatário
- ✅ Galeria de fotos
- ✅ Botões: Compartilhar, Cancelar, Avaliar

**Navegação:**
```typescript
ShipmentsScreen → [Tap ShipmentCard] → ShipmentDetailsScreen
```

### 4. ShipmentReviewScreen
- ✅ 3 ratings (estrelas): Geral, Qualidade, Pontualidade
- ✅ Comentário (opcional)
- ✅ Validações

**Navegação:**
```typescript
ShipmentDetailsScreen (delivered) → [Avaliar Entrega] → ShipmentReviewScreen
```

---

## 📊 Estrutura de Dados

### CreateShipmentData
```typescript
{
  recipientName: string;        // "João da Silva"
  recipientPhone: string;       // "11987654321" (sem formatação)
  recipientAddress: string;     // "Rua X, 123, Centro"
  description: string;          // "Documentos"
  weight: number;               // 2.5 (kg)
  dimensions?: {                // Opcional
    length: number;             // 30 (cm)
    width: number;              // 20 (cm)
    height: number;             // 10 (cm)
  };
  tripId: string;               // UUID da viagem
  paymentMethod: PaymentMethod; // "pix" | "cash"
  couponCode?: string;          // "FRETE10" (opcional)
}
```

### Shipment (retornado pelo backend)
```typescript
{
  id: string;
  trackingCode: string;         // "NJ2024000123"
  qrCode: string;               // QR Code data
  status: ShipmentStatus;       // "pending" | "in_transit" | "delivered" | "cancelled"
  price: number;                // Preço final (com desconto)
  photos: string[];             // URLs públicas do S3
  createdAt: string;            // ISO date
  trip: {
    origin: string;
    destination: string;
    departureAt: string;
  };
  // ... outros campos
}
```

---

## ✅ Checklist de Integração

### Frontend
- [x] Domain layer (types, API, service, hooks)
- [x] 3 componentes (ShipmentCard, PhotoPicker, PriceBreakdown)
- [x] 4 telas (Create, List, Details, Review)
- [x] Navegação integrada
- [x] TypeScript 0 erros
- [x] ESLint 0 erros
- [ ] Instalar react-native-image-picker ⚠️
- [ ] Descomentar código PhotoPicker ⚠️
- [ ] Rebuild app (iOS/Android) ⚠️
- [ ] Testar upload de fotos ⚠️

### Backend
- [x] 10 endpoints REST
- [x] Upload S3 com presigned URLs
- [x] Validações de segurança
- [x] Documentação completa
- [ ] Configurar AWS S3 (ou local) ⚠️
- [ ] Testar presigned URLs ⚠️
- [ ] Deploy em produção ⚠️

---

## 🎉 Conclusão

Após seguir este guia:

✅ Upload de fotos funcional (câmera + galeria)
✅ Integração S3 escalável
✅ Sistema completo de encomendas operacional

**Próximos passos:**
1. Instalar react-native-image-picker
2. Configurar permissões nativas
3. Descomentar código PhotoPicker
4. Configurar S3 no backend (ou usar local)
5. Testar fluxo completo!

---

**Dúvidas?** Leia:
- [PhotoPicker README](./src/components/PhotoPicker/README.md)
- [SHIPMENTS_API_SPEC.md](../backend/SHIPMENTS_API_SPEC.md)
- [S3_SETUP.md](../backend/S3_SETUP.md)
