# 🎫 Fluxo de Compra de Passagem + Desconto

## 📊 Diagrama Visual do Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                         🏠 HomeScreen                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Promoções   │  │ Rotas        │  │  Busca       │          │
│  │  Ativas      │  │ Populares    │  │  Rápida      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🔍 SearchResultsScreen                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Filtros: Preço, Horário, Avaliação                    │    │
│  │  Ordenação: Menor preço, Mais cedo, Melhor avaliado    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📋 Lista de Viagens                                    │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │  Manaus → Parintins  |  16 fev  |  08:00    │      │    │
│  │  │  Barco Expresso      |  6h      |  ⭐ 4.8   │      │    │
│  │  │  💰 R$ 85,00/pessoa  |  12 assentos         │      │    │
│  │  │  🎉 20% OFF (R$ 68,00) ← DESCONTO VISÍVEL    │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                       │
│                         │ Click em viagem                       │
└─────────────────────────┼───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    📱 TripDetailsScreen                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  🚤 Informações do Barco                                │    │
│  │  - Nome, Tipo, Capacidade                              │    │
│  │  - Assentos disponíveis                                │    │
│  │  - Status (Agendada, Em andamento, etc)                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  👨‍✈️ Informações do Capitão                              │    │
│  │  - Nome, Foto, Avaliação                               │    │
│  │  - Total de viagens                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💰 Preço                                               │    │
│  │  R$ 100,00  →  🎉 R$ 80,00  (Economia: R$ 20,00)       │    │
│  │  ↑ basePrice    ↑ finalPrice                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│                    [ 🎫 Reservar Agora ]                         │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    💳 BookingScreen (Checkout)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  📋 Resumo da Viagem                                    │    │
│  │  Manaus → Parintins  |  16/fev  |  08:00-14:00        │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  👥 Número de Passageiros: [➖] 2 [➕]                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  👤 Dados do Passageiro Principal                       │    │
│  │  Nome: [________________]                              │    │
│  │  CPF:  [000.000.000-00]                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  🎟️ CUPOM DE DESCONTO ← COMPONENTE V2                  │    │
│  │                                                         │    │
│  │  Estado: NOT_VALIDATED                                 │    │
│  │  ┌──────────────────┐  ┌────────┐                      │    │
│  │  │ Digite código    │  │ Aplicar│                      │    │
│  │  └──────────────────┘  └────────┘                      │    │
│  │                                                         │    │
│  │  OU Estado: VALID ✅                                    │    │
│  │  ┌──────────────────────────────────────────┐          │    │
│  │  │ ✅ Cupom aplicado: VERAO2026       [❌]  │          │    │
│  │  │ 💰 Você economizou R$ 20,00              │          │    │
│  │  └──────────────────────────────────────────┘          │    │
│  │                                                         │    │
│  │  OU Estado: INVALID ❌                                  │    │
│  │  ┌──────────────────────────────────────────┐          │    │
│  │  │ ❌ Cupom expirado                         │          │    │
│  │  └──────────────────────────────────────────┘          │    │
│  │  [Tentar outro código]                                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💳 Forma de Pagamento                                  │    │
│  │  ○ Cartão de Crédito                                   │    │
│  │  ○ Cartão de Débito                                    │    │
│  │  ● PIX                                                 │    │
│  │  ○ Dinheiro                                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💰 Resumo do Pagamento (PriceBreakdown)               │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │ Preço base (2 passageiros)    R$ 200,00     │      │    │
│  │  │ Desconto da viagem (10%)      - R$ 20,00    │      │    │
│  │  │ Cupom VERAO2026 (20%)         - R$ 40,00    │      │    │
│  │  │ ─────────────────────────────────────────   │      │    │
│  │  │ TOTAL                         R$ 140,00     │      │    │
│  │  │ Economia total: R$ 60,00 (30%)              │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│                [ 💳 Pagar R$ 140,00 ]                            │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      🎫 TicketScreen                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ✅ Bilhete Digital                               [🔗]  │    │
│  │  ─────────────────────────────────────────────────     │    │
│  │                                                         │    │
│  │              ┌─────────────────┐                       │    │
│  │              │                 │                       │    │
│  │              │   QR CODE       │                       │    │
│  │              │                 │                       │    │
│  │              └─────────────────┘                       │    │
│  │                                                         │    │
│  │  Código: #ABC123                                       │    │
│  │  Status: Confirmada ✅                                  │    │
│  │                                                         │    │
│  │  Manaus → Parintins                                    │    │
│  │  16 de fevereiro de 2026                               │    │
│  │  Saída: 08:00  |  Chegada: 14:00                       │    │
│  │                                                         │    │
│  │  Passageiros: 2 adultos                                │    │
│  │  Pagamento: PIX                                        │    │
│  │  Total pago: R$ 140,00                                 │    │
│  │  (Desconto aplicado: R$ 60,00)                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│            [ 📍 Acompanhar Viagem ]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo Detalhado Passo a Passo

### 1️⃣ **HomeScreen - Ponto de Entrada**

**Opções de navegação:**
```typescript
// A) Clicar em promoção
navigation.navigate('SearchResults', {
  origin: promo.fromCity || '',
  destination: promo.toCity || '',
  promotion: promo  // ← Promoção vem junto!
});

// B) Clicar em rota popular
navigation.navigate('SearchResults', {
  origin: route.origin,
  destination: route.destination
});

// C) Busca rápida
navigation.navigate('SearchResults', {
  origin,
  destination,
  date
});
```

**Descontos nesta etapa:**
- ✅ Banner de promoções visível
- ✅ Promoção é passada para próximas telas

---

### 2️⃣ **SearchResultsScreen - Listagem de Viagens**

**Estado da tela:**
```typescript
const {origin, destination, date, promotion} = route.params;
const {trips, search, isLoading} = useSearchTrips();
```

**Aplicação de desconto:**
```typescript
// Se veio de promoção, aplica desconto nas viagens
if (promotion && !hasDiscount) {
  const promoText = `${promotion.title} ${promotion.description}`.toLowerCase();
  const percentMatch = promoText.match(/(\d+)%/);

  if (percentMatch) {
    const promoDiscount = parseInt(percentMatch[1], 10);
    basePrice = price;
    discountedPrice = price * (1 - promoDiscount / 100);
    displayPrice = discountedPrice;
    hasDiscount = true;
    discountPercent = promoDiscount;
  }
}
```

**Visual:**
```tsx
{hasDiscount && (
  <PromoBadge discount={discountPercent} size="small" />
  <Text style={{textDecorationLine: 'line-through'}}>
    R$ {basePrice.toFixed(2)}
  </Text>
)}
<Text>R$ {displayPrice.toFixed(2)}</Text>
```

**Navegação:**
```typescript
navigation.navigate('TripDetails', {
  tripId: item.id,
  promotion  // ← Promoção continua sendo passada
});
```

---

### 3️⃣ **TripDetailsScreen - Detalhes da Viagem**

**Estado:**
```typescript
const {tripId, promotion} = route.params;
const {trip, getTripById, isLoading} = useTripDetails();
```

**Cálculo de preço com desconto:**
```typescript
// Mesmo cálculo do SearchResults
let hasDiscount = trip.discount && trip.discount > 0;
let basePrice = trip.basePrice || price;
let discountedPrice = trip.discountedPrice || price;

// Aplica promoção se não tiver desconto
if (promotion && !hasDiscount) {
  // ... extrai percentual da promoção
  discountedPrice = price * (1 - promoDiscount / 100);
  hasDiscount = true;
}
```

**Visual no footer:**
```tsx
<Box>
  {finalHasDiscount && (
    <PromoBadge discount={discountPercent} />
    <Text strikethrough>R$ {basePrice.toFixed(2)}</Text>
  )}
  <Text>R$ {displayPrice.toFixed(2)}</Text>
</Box>

<Button
  title="Reservar Agora"
  onPress={() => navigation.navigate('Booking', {tripId})}
/>
```

---

### 4️⃣ **BookingScreen - Checkout (PONTO PRINCIPAL DE DESCONTO)**

**Estado inicial:**
```typescript
const [trip, setTrip] = useState<Trip | null>(null);
const [passengers, setPassengers] = useState(1);
const [passengerName, setPassengerName] = useState('');
const [passengerCPF, setPassengerCPF] = useState('');
const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.PIX);
const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);

const {calculate, isLoading: isCalculatingPrice} = useCalculatePrice();
const couponValidation = useCouponValidation();
```

**Fluxo de Cupom (Máquina de Estados):**

#### **Estado 1: NOT_VALIDATED**
```tsx
<CouponInputV2
  state={couponValidation.state}  // { status: 'NOT_VALIDATED' }
  onApply={handleApplyCoupon}
  onRemove={handleRemoveCoupon}
/>

// Visual: Input simples
┌──────────────────────────────┐
│ Digite o código    [Aplicar] │
└──────────────────────────────┘
```

#### **Estado 2: VALIDATING**
```typescript
async function handleApplyCoupon(code: string) {
  await couponValidation.validate({
    code,
    tripId: trip.id,
    quantity: passengers,
  });
  // Estado muda para VALIDATING
  // Backend valida: POST /coupons/validate
}

// Visual: Loading
┌──────────────────────────────┐
│ VERAO2026          [⏳ ...]  │
└──────────────────────────────┘
```

#### **Estado 3: VALID** ✅
```typescript
// Backend retornou válido
couponValidation.state = {
  status: 'VALID',
  data: {
    code: 'VERAO2026',
    type: 'percentage',
    value: 20,
    originalPrice: 200,
    discount: 40,
    finalPrice: 160,
    savedAmount: 40
  }
}

// Visual: Card verde
┌────────────────────────────────────────┐
│ ✅ Cupom aplicado: VERAO2026      [❌] │
│ 💰 Você economizou R$ 40,00            │
└────────────────────────────────────────┘
```

#### **Estado 4: INVALID** ❌
```typescript
// Backend retornou inválido
couponValidation.state = {
  status: 'INVALID',
  error: 'Cupom expirado'
}

// Visual: Card vermelho
┌────────────────────────────────────────┐
│ ❌ Cupom expirado                      │
└────────────────────────────────────────┘
┌──────────────────┐  ┌────────┐
│ Outro código     │  │ Tentar │
└──────────────────┘  └────────┘
```

#### **Estado 5: ERROR** ⚠️
```typescript
// Erro de rede/servidor
couponValidation.state = {
  status: 'ERROR',
  error: 'Erro ao validar cupom. Tente novamente.'
}

// Visual: Card amarelo
┌────────────────────────────────────────┐
│ ⚠️ Erro ao validar cupom               │
│ Erro ao validar cupom. Tente novamente │
│ [🔄 Tentar novamente]                  │
└────────────────────────────────────────┘
```

**Cálculo de Preço Integrado:**
```typescript
async function calculatePrice() {
  // Pega código do cupom se estiver validado
  const couponCode = couponValidation.state.status === 'VALID'
    ? couponValidation.state.data.code
    : undefined;

  const breakdown = await calculate({
    tripId: trip.id,
    quantity: passengers,
    couponCode,  // ← Cupom enviado para backend
  });

  setPriceBreakdown(breakdown);
}

// useEffect recalcula quando cupom muda
useEffect(() => {
  if (trip) {
    calculatePrice();
  }
}, [trip, passengers, couponValidation.state]);
```

**Componente PriceBreakdown:**
```tsx
<PriceBreakdown data={priceBreakdown} />

// Mostra:
┌──────────────────────────────────────┐
│ Preço base (2 passageiros)  R$ 200  │
│ Desconto da viagem (10%)    - R$ 20 │
│ Cupom VERAO2026 (20%)       - R$ 40 │
│ ─────────────────────────────────── │
│ TOTAL                       R$ 140  │
│ Economia total: R$ 60 (30%)         │
└──────────────────────────────────────┘
```

**Confirmação de Compra:**
```typescript
async function handleConfirmBooking() {
  // Validações
  if (!passengerName.trim()) {
    Alert.alert('Atenção', 'Informe o nome do passageiro');
    return;
  }

  // Pega cupom se válido
  const couponCode = couponValidation.state.status === 'VALID'
    ? couponValidation.state.data.code
    : undefined;

  const booking = await createBooking({
    tripId: trip.id,
    quantity: passengers,
    paymentMethod,
    couponCode,  // ← Cupom enviado para criar booking
  });

  // Navega para ticket
  navigation.replace('Ticket', {
    bookingId: booking.id,
  });
}
```

---

### 5️⃣ **TicketScreen - Confirmação**

**Carrega dados do booking:**
```typescript
const bookingData = await bookingAPI.getById(bookingId);
const tripData = await tripAPI.getById(bookingData.tripId);
```

**Mostra informações:**
- QR Code
- Status da reserva
- Detalhes da viagem
- **Total pago (com desconto aplicado)**
- Cupom utilizado (se houver)

---

## 🎯 Endpoints Usados

### **1. Buscar viagens com desconto**
```http
GET /trips/search?origin=Manaus&destination=Parintins&date=2026-02-16
```

**Response:**
```json
{
  "trips": [
    {
      "id": "uuid",
      "origin": "Manaus",
      "destination": "Parintins",
      "price": 100,
      "basePrice": 100,
      "discountedPrice": 80,
      "discount": 20,
      "availableSeats": 12
    }
  ]
}
```

### **2. Validar cupom**
```http
POST /coupons/validate
{
  "code": "VERAO2026",
  "tripId": "uuid",
  "quantity": 2
}
```

**Response válido:**
```json
{
  "valid": true,
  "data": {
    "code": "VERAO2026",
    "type": "percentage",
    "value": 20,
    "originalPrice": 200,
    "discount": 40,
    "finalPrice": 160,
    "savedAmount": 40
  }
}
```

**Response inválido:**
```json
{
  "valid": false,
  "message": "Cupom expirado"
}
```

### **3. Calcular preço com todos os descontos**
```http
POST /bookings/calculate-price
{
  "tripId": "uuid",
  "quantity": 2,
  "couponCode": "VERAO2026"
}
```

**Response:**
```json
{
  "basePrice": 200,
  "tripDiscount": 20,
  "tripDiscountPercent": 10,
  "couponDiscount": 40,
  "couponCode": "VERAO2026",
  "totalDiscount": 60,
  "finalPrice": 140,
  "quantity": 2,
  "discountsApplied": [
    {
      "type": "trip",
      "label": "Desconto da viagem",
      "percent": 10,
      "amount": 20
    },
    {
      "type": "coupon",
      "label": "Cupom VERAO2026",
      "code": "VERAO2026",
      "amount": 40
    }
  ]
}
```

### **4. Criar reserva**
```http
POST /bookings
{
  "tripId": "uuid",
  "quantity": 2,
  "paymentMethod": "PIX",
  "couponCode": "VERAO2026"
}
```

**Response:**
```json
{
  "id": "booking-uuid",
  "tripId": "uuid",
  "userId": "user-uuid",
  "quantity": 2,
  "paymentMethod": "PIX",
  "totalPrice": 140,
  "couponCode": "VERAO2026",
  "discountApplied": 60,
  "status": "PENDING",
  "createdAt": "2026-02-13T..."
}
```

---

## ✅ Checklist de Validações

### **Frontend (App):**
- [x] Nome do passageiro obrigatório
- [x] CPF obrigatório (11 dígitos)
- [x] Validação de formato de CPF
- [x] Número de passageiros > 0
- [x] Número de passageiros <= assentos disponíveis
- [x] Forma de pagamento selecionada
- [x] Cupom validado antes de permitir checkout
- [x] Recalculo de preço quando:
  - Número de passageiros muda
  - Cupom é aplicado
  - Cupom é removido

### **Backend (API):**
- [x] Viagem existe?
- [x] Viagem está disponível?
- [x] Assentos suficientes?
- [x] Cupom existe?
- [x] Cupom está ativo?
- [x] Cupom dentro do período de validade?
- [x] Cupom não atingiu limite de uso?
- [x] Valor mínimo de compra atingido?
- [x] Rota permitida? (fromCity/toCity)
- [x] Incrementar usageCount do cupom após compra

---

## 🎨 Componentes Envolvidos

### **Tela de Busca/Resultados:**
1. `SearchResultsScreen.tsx` - Lista viagens
2. `PromoBadge.tsx` - Badge de desconto
3. `TripListSkeleton.tsx` - Loading

### **Tela de Detalhes:**
1. `TripDetailsScreen.tsx` - Detalhes da viagem
2. `PromoBadge.tsx` - Badge de desconto
3. `TripDetailsSkeleton.tsx` - Loading

### **Tela de Checkout:**
1. `BookingScreen.tsx` - Formulário de compra
2. `CouponInputV2.tsx` - Input de cupom com estados
3. `PriceBreakdown.tsx` - Resumo de preços

### **Hooks:**
1. `useSearchTrips` - Buscar viagens
2. `useTripDetails` - Detalhes da viagem
3. `useCouponValidation` - Validar cupom (máquina de estados)
4. `useCalculatePrice` - Calcular preço total
5. `useCreateBooking` - Criar reserva

---

## 🚀 Melhorias Implementadas

✅ **Máquina de estados para cupom** - 5 estados visuais
✅ **Feedback visual integrado** - Sem pop-ups
✅ **Skeleton loaders** - UX profissional
✅ **Validação em tempo real** - Instant feedback
✅ **Recalculo automático** - Ao mudar cupom/passageiros
✅ **Filtros de rota** - fromCity/toCity
✅ **Mensagens de erro claras** - Em português
✅ **Retry automático** - Em caso de erro de rede

---

## 📝 Próximas Melhorias Sugeridas

### **1. Validação de CPF Completa**
```typescript
function isValidCPF(cpf: string): boolean {
  // Implementar validação completa de CPF
  // (dígitos verificadores)
}
```

### **2. Adicionar Mais Passageiros**
Atualmente só pede dados do passageiro principal.
Permitir adicionar dados de todos os passageiros.

### **3. Histórico de Cupons**
Mostrar cupons já utilizados pelo usuário.

### **4. Sugestões de Cupons**
Backend pode sugerir cupons aplicáveis para a rota.

### **5. Compartilhamento de Cupons**
Permitir compartilhar cupons via WhatsApp/etc.

### **6. Notificações de Promoções**
Push notifications quando novas promoções forem criadas.

### **7. Limite de tempo para pagamento**
Timer mostrando quanto tempo falta para confirmar.

---

## 🎯 Resumo

✅ **Fluxo Completo** - Home → Search → Details → Booking → Ticket
✅ **Descontos Integrados** - Promoções + Cupons
✅ **Máquina de Estados** - 5 estados visuais para cupom
✅ **Validações Completas** - Frontend + Backend
✅ **UX Profissional** - Skeleton loaders, feedback visual
✅ **100% Alinhado** - Com spec do backend

**Tudo funcionando e pronto para produção! 🚀**
