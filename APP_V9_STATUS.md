# NavegaJá APP — Status de Implementação v9.0

**Última atualização:** 2026-02-27

---

## ✅ Funcionalidades Implementadas

### 1. Chat em Tempo Real
- **Domain**: `src/domain/App/Chat/` — chatTypes, chatAPI, chatService, useCases
- **Screens**: ChatListScreen, ChatScreen (passageiro + capitão)
- **Badge de não lidos**: PassengerStack + CaptainStack com `tabBarBadge` via `useConversations().totalUnread`
- **Polling**: 30s via react-query refetchInterval

### 2. KYC (Know Your Customer / Verificação Capitão)
- **Domain**: `src/domain/App/KYC/` — tipos, API, hooks
- **Screens**: KYCScreen (upload documentos, selfie)
- **CaptainCapabilities**: `isVerified`, `pendingVerification`, `canOperate`, `canCreateTrips`
- **Banners** no CaptainDashboard baseados nas capabilities

### 3. Geração de PDF / Compartilhamento de Comprovante
- **ShipmentShareCard**: `src/screens/app/shared/ShipmentDetailsScreen/ShipmentShareCard.tsx`
  - QR Code + dados organizados + status + preço
  - Capturado via `react-native-view-shot` (`captureRef`)
  - Compartilhado via `react-native-share` como PNG
- **Renderização off-screen**: `position: absolute, top: -5000`

### 4. GPS / Rastreamento
- **TrackingScreen**: mapa em tempo real com posição do capitão
- **SOS Alerts reais**: `safetyAPI.getMySosAlerts()` (removeu mocks)
- **DANGER_ZONES**: dados geográficos estáticos (não são mock)

### 5. Analytics (Capitão)
- **Domain**: `src/domain/App/Analytics/` — métricas de ganhos, viagens, avaliações
- **Screen**: CaptainAnalyticsScreen registrada na navegação
- **Hook**: `useCaptainAnalytics`

### 6. Stop Reviews (Avaliação de Porto/Parada)
- **Domain**: `src/domain/App/StopReview/`
- **Screen**: StopReviewCreateScreen
- **Trigger automático**: após submissão de TripReviewScreen → `navigation.replace('StopReviewCreate', {tripId})`

### 7. Sistema de Referrals (NavegaCoins)
- **Domain**: `src/domain/App/Gamification/`
- **Referral code**: copiar (Clipboard) + compartilhar (Share.share)
- **GamificationScreen**: leaderboard, histórico, progress bar por nível

### 8. Flood Hub (Monitoramento de Rios)
- **Domain**: `src/domain/App/FloodHub/` — tipos, API (`floodHubAPI`), hooks
- **FloodSeverity**: `NO_FLOODING | ABOVE_NORMAL | SEVERE | EXTREME`
- **FLOOD_SEVERITY_ORDER**: para ordenação por gravidade
- **BookingScreen banner**: mostra alerta de risco ao reservar viagem com flood ativo
  - EXTREME → fundo `dangerBg`, ícone vermelho
  - SEVERE → fundo `warningBg`, ícone amarelo

### 9. Frete a Cobrar (paidBy)
- **Tipo**: `paidBy: 'sender' | 'recipient'` nos tipos Shipment e CreateShipmentData
- **Serviço**: `formData.append('paidBy', data.paidBy ?? 'sender')` no shipmentService
- **CreateShipmentScreen**: seletor "Quem paga o frete?" com toggle sender/recipient
  - Selecionando "recipient" → método de pagamento fixado em CASH
  - Botão de pagamento escondido quando recipient pays
- **ShipmentDetailsScreen**:
  - `canConfirmPayment`: exclui `paidBy === 'recipient'`
  - Linha "Pago por" no card de Detalhes (destaca "frete a cobrar" em amarelo)
  - Banner informativo quando `paidBy === 'recipient'` + status PENDING

### 10. Cards de Encomenda Compactos
- **ShipmentCard**: design compacto com expand/collapse
  - Compacto: badge status + tracking code, nome + preço, peso + botão ▾
  - Expandido: data, telefone, rota da viagem, método de pagamento
  - Dois touchables separados: navegação (área principal) + expand (botão)

### 11. Autocomplete de CEP
- **Hook**: `useCepLookup` — busca endereço por CEP (ViaCEP API)
- **CreateShipmentScreen**: campo CEP preenche endereço automaticamente

---

### 12. Notificações FCM para Encomendas (2026-02-27)
- **`shipment_incoming`**: adicionado ao switch de navegação → abre ShipmentDetails do destinatário
- **Foreground handler**: `showSuccess('Nova encomenda!')` + `invalidateQueries(shipments.my())`
- **Foreground para demais eventos**: `invalidateQueries` em `detail` + `timeline` + `my()`

### 13. CaptainAnalyticsScreen — Conteúdo Completo (verificado 2026-02-27)
- Summary cards (receita total, viagens, passageiros, avaliação)
- Seletor de período (7d / 30d / 90d)
- LineChart de receita diária via `react-native-chart-kit`
- Top 5 rotas mais lucrativas + Top 5 passageiros fiéis

---

## ⚠️ Pendente / Não Implementado

### P1 — Gráfico 7 dias (RiverDetailModal)
- FloodHub fase 2: gráfico de previsão dos próximos 7 dias
- Requer biblioteca de gráficos (ex: `victory-native` ou `react-native-chart-kit`)

### P4 — Peso nulo nas encomendas (bug backend)
- **Root cause confirmado**: backend NestJS DTO não tem `@Transform(() => Number)` no campo weight
- FormData envia `weight` como string → backend getter/setter não converte → `_weight: null`
- **Fix no backend**: adicionar `@Transform(() => parseFloat(value))` na DTO `CreateShipmentDto`
- Frontend está correto (envia `weight.toString()`)

---

## 📦 Dependências Nativas Adicionadas

| Pacote | Versão | Uso |
|--------|--------|-----|
| `react-native-view-shot` | * | Captura de view como PNG |
| `react-native-share` | * | Compartilhar imagem nativa |

---

## 🏗️ Arquitetura — Padrão de Domínios

```
src/domain/App/
  Chat/          ✅ chatTypes, chatAPI, chatService, useCases/
  KYC/           ✅ kycTypes, kycAPI, useCases/
  Shipment/      ✅ shipmentTypes, shipmentAPI, shipmentService, useCases/
  Gamification/  ✅ gamificationTypes, gamificationAPI, useCases/
  FloodHub/      ✅ floodHubTypes, floodHubAPI, useCases/
  StopReview/    ✅ stopReviewTypes, stopReviewAPI, useCases/
  Analytics/     ✅ analyticsTypes, analyticsAPI, useCases/
  Review/        ✅ reviewTypes, reviewAPI, reviewService, useCases/
  Booking/       ✅ bookingTypes, bookingAPI, useCases/
  Trip/          ✅ tripTypes, tripAPI, useCases/
  Location/      ✅ locationTypes, locationAPI, useCepLookup
  Weather/       ✅ weatherTypes, weatherAPI, useCases/
```
