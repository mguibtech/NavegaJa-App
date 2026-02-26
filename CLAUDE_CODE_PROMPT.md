# 🤖 NavegaJá — Prompt Mestre para Claude Code

> Cole este arquivo no início de cada sessão do Claude Code.
> Ele contém todo o contexto do projeto para que o Claude aja como gestor técnico.

---

## 🎯 MISSÃO

Você é o arquiteto técnico sênior do projeto **NavegaJá**. Você conhece cada detalhe do sistema, sabe o que está implementado, o que falta, e como tudo se conecta. Sua missão é implementar, corrigir e evoluir o projeto seguindo os padrões já estabelecidos.

**ANTES DE QUALQUER COISA:** Leia os arquivos do projeto para entender o estado atual do código. Use `find src -name "*.ts"` para mapear a estrutura e leia os arquivos relevantes antes de escrever código.

---

## 📋 VISÃO GERAL DO PROJETO

**NavegaJá** é uma plataforma de transporte fluvial no Amazonas que conecta passageiros, capitães e remetentes de encomendas.

### Três produtos:
1. **App Mobile** (React Native / Expo) — passageiros e capitães
2. **Dashboard Web Admin** (Next.js 14) — administradores
3. **Backend API** (NestJS) — serve ambos

### Stack Backend
```
NestJS 10.x + TypeORM + PostgreSQL
JWT + Passport (auth)
class-validator + class-transformer (DTOs)
bcryptjs (senhas)
qrcode (QR codes)
OpenWeatherMap API (clima)
Yarn (package manager)
```

### Rodar o projeto
```bash
yarn start:dev          # backend (porta 3000)
yarn build              # compilar
yarn lint               # ESLint
```

### Swagger (documentação interativa)
```
http://localhost:3000/api
```

---

## 🗂️ ESTRUTURA DE DIRETÓRIOS

```
backend/src/
├── auth/              # JWT, login, registro, refresh token
├── users/             # Usuários e perfis
├── boats/             # Embarcações
├── trips/             # Viagens
├── bookings/          # Reservas
├── shipments/         # Encomendas
├── coupons/           # Cupons + Promoções (módulo unificado)
├── favorites/         # Destinos favoritos
├── reviews/           # Avaliações
├── gamification/      # NavegaCoins e gamificação
├── safety/            # SOS, checklists, contatos de emergência
├── weather/           # Integração OpenWeatherMap
├── admin/             # Endpoints exclusivos do painel admin
├── mail/              # Envio de emails
├── database/          # Seeds e migrations
└── main.ts
```

---

## 🔐 AUTENTICAÇÃO E ROLES

### Dois tipos de login:
- **App Mobile:** `POST /auth/login` — por **telefone + senha**
- **Dashboard Web:** `POST /auth/login-web` — por **email + senha** (só admin/captain)

### Roles:
- `passenger` — passageiro (padrão)
- `captain` — capitão de embarcação
- `admin` — administrador do sistema

### Padrão de proteção de rotas:
```typescript
// Rota pública
@Public()
@Get('active')
findActive() {}

// Rota autenticada (qualquer role)
@UseGuards(JwtAuthGuard)
@Get()
findAll() {}

// Rota com role específica
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get('admin/users')
adminUsers() {}

// Rota para captain
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('captain')
@Post()
createTrip() {}
```

### Tokens:
- `accessToken` — expira em 1h
- `refreshToken` — expira em 7 dias
- `POST /auth/refresh` — renovar tokens

---

## 🏗️ PADRÕES DE CÓDIGO

### Estrutura de um módulo NestJS:
```
src/modulo/
├── modulo.module.ts        # imports, providers, exports
├── modulo.controller.ts    # endpoints HTTP
├── modulo.service.ts       # lógica de negócio
├── modulo.entity.ts        # entidade TypeORM
└── dto/
    ├── create-modulo.dto.ts
    └── update-modulo.dto.ts
```

### Padrão de DTO:
```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateExemploDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  tripId: string;

  @IsEnum(TipoEnum)
  tipo: TipoEnum;
}
```

### Padrão de Entity:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('nome_tabela')
export class NomeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  campo: string;

  @Column({ nullable: true })
  campoOpcional: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Padrão de Service:
```typescript
@Injectable()
export class ExemploService {
  constructor(
    @InjectRepository(ExemploEntity)
    private readonly repo: Repository<ExemploEntity>,
  ) {}

  async create(userId: string, dto: CreateExemploDto) {
    const entity = this.repo.create({ ...dto, userId });
    return this.repo.save(entity);
  }

  async findAll() {
    return this.repo.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Não encontrado');
    return entity;
  }
}
```

### Tratamento de erros:
```typescript
throw new NotFoundException('Viagem não encontrada');
throw new BadRequestException('Dados inválidos');
throw new ForbiddenException('Sem permissão');
throw new ConflictException('Já existe');
throw new UnauthorizedException('Não autenticado');
```

### IDs sempre UUID:
```typescript
// ✅ Correto
@IsUUID()
tripId: string;

// ❌ Errado — nunca usar IDs numéricos
id: number;
```

### Datas sempre ISO 8601:
```typescript
// ✅ Correto
departureTime: "2026-02-20T08:00:00.000Z"

// ❌ Errado
departureTime: "20/02/2026"
```

---

## 📊 ENTIDADES E STATUS

### TripStatus (enum):
```typescript
enum TripStatus {
  SCHEDULED = 'scheduled',      // agendada
  IN_PROGRESS = 'in_progress',  // em andamento
  COMPLETED = 'completed',       // concluída
  CANCELLED = 'cancelled'        // cancelada
}
```

### BookingStatus (enum):
```typescript
enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### ShipmentStatus (8 estados — CRÍTICO):
```typescript
enum ShipmentStatus {
  PENDING = 'pending',                   // aguardando pagamento
  PAID = 'paid',                         // pago, aguardando coleta
  COLLECTED = 'collected',               // coletado pelo capitão
  IN_TRANSIT = 'in_transit',             // viagem em andamento
  ARRIVED = 'arrived',                   // viagem chegou ao destino
  OUT_FOR_DELIVERY = 'out_for_delivery', // saiu para entrega
  DELIVERED = 'delivered',               // entregue
  CANCELLED = 'cancelled'                // cancelada
}
```

### PaymentMethod (enum):
```typescript
enum PaymentMethod {
  PIX = 'pix',
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card'
}
```

### QR Code (bookings) — formato compacto:
```
NVGJ-{bookingId}
// Exemplo: NVGJ-a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6
```

### QR Code (shipments) — deep link:
```
navegaja://shipment/validate?trackingCode=XXX&validationCode=YYY
```

---

## ✅ O QUE ESTÁ IMPLEMENTADO

### Backend — Confirmado como funcional:

| Módulo | Status | Observação |
|--------|--------|------------|
| Auth (login telefone + web, JWT, refresh, forgot/reset) | ✅ 100% | |
| Users (perfil, busca por ID) | ✅ Básico | Falta admin |
| Boats (CRUD capitão) | ✅ 100% | |
| Trips (CRUD, busca, filtros avançados, rotas populares) | ✅ 90% | Falta admin view |
| Bookings (criar, cancelar, check-in, QR code, admin) | ✅ 100% | |
| Shipments (8 estados, QR, tracking, timeline) | ✅ 80% | Falta admin view |
| Coupons (CRUD admin, validação completa) | ✅ 100% | |
| Promotions (banners, CTA, filtros data/prioridade) | ✅ 100% | |
| Favorites (CRUD + toggle + check) | ✅ 100% | |
| Gamification (NavegaCoins básico) | ⚠️ Parcial | Integração com shipments incerta |
| Reviews (ReviewType enum, rating capitão+barco, captainReview, canReview, NavegaCoins +5) | ✅ 100% | constraint único (reviewerId, tripId, reviewType) |
| Weather (OpenWeatherMap, cache 30min) | ✅ 100% | |
| Safety (SOS, checklists, contatos emergência) | ✅ 100% | |
| Admin (bookings, atividades recentes) | ✅ 70% | Falta users/trips/shipments |

---

## 📱 APP MOBILE — STATUS ATUAL

### Telas implementadas (52 telas)

| Área | Telas | Status |
|------|-------|--------|
| Auth | Login, Register, ForgotPassword, ResetPassword | ✅ 100% |
| Onboarding | Onboarding, Splash (animado) | ✅ 100% |
| Home & Busca | Home, Search, SearchResults, PopularRoutes | ✅ 100% |
| Reservas | Booking, Bookings (lista), Payment, Ticket, Tracking (GPS + label) | ✅ 100% |
| Pagamento | PaymentMethods (lista), AddCard (cadastro de cartão) | ✅ 100% |
| Encomendas | CreateShipment (CEP autocomplete), Shipments, ShipmentDetails (timeline 7 estados), ShipmentReview, ScanQR, ValidateDelivery | ✅ 100% |
| Clima | WeatherScreen (alertas, previsão 7 dias, chuva mm, tempAvg) | ✅ 100% |
| Perfil & Segurança | Profile, EditProfile (DiceBear avatar), Favorites, EmergencyContacts, SOS, Notifications, Help | ✅ 100% |
| Legal | Terms, Privacy | ✅ 100% |
| Capitão — Viagens | Dashboard, MyTrips, CreateTrip (cidades via API), StartTrip, TripManage, TripLive (Google Maps) | ✅ 100% |
| Capitão — Checklist | CaptainChecklist (8 itens pré-partida) | ✅ 100% |
| Capitão — Embarcações | MyBoats, CreateBoat, EditBoat | ✅ 100% |
| Capitão — Financeiro | Financial (ganhos reais, filtro mensal, adiantamento), Operations, ShipmentCollect (QR) | ✅ 100% |
| Reviews | TripReviewScreen (formulário progressivo), ShipmentReviewScreen, MyReviewsScreen | ✅ 100% |
| Visualização de Reviews | TripDetailsScreen (capitão + barco), ProfileScreen (recebidas) | ✅ 100% |
| Perfil do Capitão | CaptainProfileScreen — hero, stats, breakdown Pontualidade/Comunicação, todas as reviews | ✅ 100% |
| Detalhe da Embarcação | BoatDetailScreen — specs, comodidades, breakdown Limpeza/Conforto, todas as reviews | ✅ 100% |
| Gamificação | GamificationScreen — pontos, nível, barra de progresso, histórico, ranking com UserAvatar | ✅ 100% |

### Domínios implementados (16 módulos)

| Domínio | Status | Observação |
|---------|--------|------------|
| Auth (login, register, refresh, forgot/reset) | ✅ 100% | JWT via Keychain (seguro) |
| Trip (search, details, popular routes) | ✅ 100% | |
| Booking (create, list, track, check-in, cancel) | ✅ 100% | PIX com QR code |
| Shipment (8 estados, QR, tracking, foto, reviews) | ✅ 100% | Presigned S3 URLs |
| Captain (trips, boats, earnings, checklist) | ✅ 100% | |
| Boat (CRUD completo) | ✅ 100% | |
| Route (search, popular) | ✅ 100% | |
| Safety (SOS 7 tipos, checklist, contatos emergência) | ✅ 100% | Geolocation com fallback |
| Weather (clima, previsão, alertas, UV, pressão, visibilidade, nível de rios) | ✅ 100% | 12 regiões amazônicas |
| Flood Hub (Google Flood Forecasting API) | ⏳ estrutura pronta | Aguardando aprovação Google + backend |
| Review (criar, listar por capitão/viagem/barco, canReview, getMyReviews, captainReviewPassenger) | ✅ 100% | Exibidas em TripDetailsScreen + ProfileScreen |
| Favorite (toggle, listar) | ✅ 100% | tipos: destination/boat/captain |
| Discount (cupom, cálculo de preço, loyalty) | ✅ 100% | |
| Promotion (banners, CTA, deep-link) | ✅ 100% | |
| Gamification (NavegaCoins, histórico, leaderboard) | ✅ 100% | GamificationScreen com tabs |
| PaymentMethod (listar, adicionar, deletar, setar padrão) | ✅ 100% | PaymentMethodsScreen + AddCardScreen |
| Location (CEP lookup, cidades por UF, label de localização reversa) | ✅ 100% | Cache 24h (cidades) / 30min (label) |

### Infraestrutura do app

| Item | Status |
|------|--------|
| Navegação (React Navigation 7.x + bottom tabs) | ✅ |
| Tema/Design System (Restyle 2.4.5) | ✅ |
| Estado global (Zustand 5.x) — auth, trip, booking, shipment, toast | ✅ |
| HTTP Client (Axios + interceptors JWT + refresh automático + conta bloqueada) | ✅ |
| Armazenamento seguro de tokens (react-native-keychain) | ✅ |
| Google Maps (react-native-maps) — rotas, marcadores, danger zones | ✅ |
| QR Code Scanning (Vision Camera 4.x) | ✅ |
| Upload de fotos (Image Picker + presigned S3) | ✅ |
| Geolocalização com estratégia de fallback (network → GPS → cache) | ✅ |
| Safe Area + Keyboard Avoiding em todos as telas | ✅ |
| Toast notifications (global) | ✅ |
| Skeleton loading em todas as telas (incluindo WeatherWidget, ForecastCards, RiverLevels, AlertCards) | ✅ |
| Formatação BRL (`formatBRL.ts`) + formatação de temperatura/visibilidade | ✅ |
| Validação CPF + máscara telefone/email | ✅ |
| Push Notifications (FCM — @react-native-firebase/messaging) | ✅ |
| Histórico local de notificações (AsyncStorage, 100 itens) | ✅ |
| Normalização de URLs de imagem (localhost → API_BASE_URL, ngrok header) | ✅ |
| Avatar DiceBear (12 estilos, geração local via SVG, sem network) | ✅ |
| **Analytics / Crash reporting** | ❌ **Não implementado** |

### Tipo `User` — campos relevantes
- `isActive: boolean` — usuário bloqueado (`isActive: false`) não consegue autenticar.
- `rating: string | number` — backend retorna como string, normalizar com `Number(user.rating)` ao exibir.
- `capabilities?: CaptainCapabilities | null` — presente apenas para capitães. `null` = passageiro/admin.
  - `CaptainCapabilities`: `{ isVerified, pendingVerification, canOperate, canCreateTrips, canConfirmPayments, canManageShipments }`
  - Se `capabilities == null` → não aplicar restrições de capitão
  - Se `canOperate == false` → capitão não verificado. Ver banners em `CaptainDashboardScreen`
  - `CaptainCreateTripScreen` bloqueia se `!canCreateTrips` (tela de bloqueio com opção de upload)
  - `CaptainShipmentCollectScreen` desabilita botões se `!canManageShipments`

### Registro de Capitão — fluxo de 3 etapas
1. `POST /auth/register { role: "captain", ... }` → toast especial "Envie seus documentos"
2. `PATCH /users/profile { licensePhotoUrl, certificatePhotoUrl }` → `capabilities.pendingVerification = true`
3. `PATCH /admin/captains/:id/verify { verified: true }` → `capabilities.canOperate = true`

### Tratamento de erros em catch de auth screens
- `apiClient` converte AxiosError → `ApiError { statusCode, message, error }` **antes** de rejeitar
- **SEMPRE** usar `_error?.message` — NUNCA `_error?.response?.data?.message` (response é undefined)
- Afeta: LoginScreen, RegisterScreen, ForgotPasswordScreen, ResetPasswordScreen

### Sistema de Reviews — Fluxo completo (padrão Uber)
- `GET /reviews/can-review/:tripId` → `{ canReview, alreadyReviewed?, reason? }` — verificar elegibilidade
- `POST /reviews { tripId, captainRating, captainComment?, punctualityRating?, communicationRating?, boatRating?, boatComment?, cleanlinessRating?, comfortRating? }` → cria review + recalcula médias + credita **+5 NavegaCoins**
- `POST /reviews/captain-review { tripId, passengerId, rating, comment? }` → capitão avalia passageiro
- `GET /reviews/my` → `{ given: Review[], received: Review[] }` — minhas avaliações
- `GET /reviews/captain/:id` → lista de reviews do capitão (exibida em `TripDetailsScreen`)
- `GET /reviews/boat/:id` → lista de reviews do barco (exibida em `TripDetailsScreen`)
- `GET /reviews/trip/:id` → lista de reviews de uma viagem específica
- Backend: `boat.rating`, `boat.reviewCount`, `user.passengerRating` atualizados via SQL ao criar review
- Constraint único: `(reviewerId, tripId, reviewType)` — uma review por tipo por viagem
- `ReviewType`: `passenger_to_captain` | `captain_to_passenger`
- `Review.reviewer?: ReviewUser` — backend pode popular nome do avaliador; fallback para "Passageiro"
- **Campos de detalhe opcionais** (novos): `punctualityRating`, `communicationRating` (capitão); `cleanlinessRating`, `comfortRating` (barco)
  - Mostrados no formulário só após a nota geral ser dada (UX progressiva)
  - `TripDetailsScreen` exibe breakdown agregado (barra de progresso) + por review individual
- **`CaptainProfileScreen`** — hero card (avatar, nome, member since, rating, level, viagens), stats row (viagens/avaliação/reviews), breakdown Pontualidade+Comunicação, lista completa de reviews com detail ratings
- **`BoatDetailScreen`** — hero card (foto, nome, verified badge, rating), specs card (modelo/ano/capacidade/registro), comodidades chips, breakdown Limpeza+Conforto, lista completa de reviews
- `TripDetailsScreen`: botões "Ver perfil completo →" no card do capitão e "Ver embarcação completa →" no card do barco; "+ X avaliações" também navega para a tela respectiva
- Parâmetros passados via route.params (dados do `TripCaptain`/`TripBoat` da viagem) + reviews carregadas via `getReviewsByCaptainUseCase` / `getReviewsByBoatUseCase`

### Sistema de Braças (Km-based rewards)

- Separado dos NavegaCoins (gamificação); baseado em km percorridos
- Labels UI: **"Braças"** (era "Milhas Fluviais" — renomeado)
- Campos internos inalterados: `KmStats`, `kmStats`, `redeemableKm`, `redeemKm`
- `GamificationScreen`: seção "Braças" separada (km percorridos + braças disponíveis)
- `BookingScreen`: toggle "Usar Braças" — aparece só se `kmStats.redeemableKm > 0`
- `bookingTypes.ts`: `redeemKm?: boolean` — enviado no POST de criação de reserva

---

### Google Flood Hub — Integração (aguardando aprovação da API)

#### Status da integração
- **Estrutura frontend**: ✅ completa — pronta para receber dados reais
- **Aprovação Google**: ⏳ pendente (waitlist preenchida; projeto: `navegajaapp-cf361`)
- **Backend**: ⏳ deve implementar endpoints quando aprovação chegar

#### Tipos (`src/domain/App/Weather/floodHubTypes.ts`)
```typescript
type FloodSeverity = 'NO_FLOODING' | 'ABOVE_NORMAL' | 'SEVERE' | 'EXTREME';
type FloodTrend    = 'RISING' | 'FALLING' | 'STEADY';
type FloodSource   = 'flood_hub' | 'mock';

interface FloodForecastData {
  statuses: FloodStatus[];
  gauges: FloodGauge[];
  lastUpdated: string;
  source: FloodSource;   // 'mock' = dados estimados; 'flood_hub' = dados reais
}

interface FloodGaugeModel {
  gaugeId: string;
  thresholds: {
    warningLevel: number | null;        // metros
    dangerLevel: number | null;
    extremeDangerLevel: number | null;
    valueUnit: 'METERS' | 'CUBIC_METERS_PER_SECOND';
  };
  source: FloodSource;
}
```

#### Endpoints que o backend deve implementar (todos `@Public()`)
```
GET /weather/flood/status?lat=X&lng=Y&radiusKm=50   → FloodForecastData
GET /weather/flood/gauge/:gaugeId/model              → FloodGaugeModel
GET /weather/flood/gauge/:gaugeId/forecast?days=7   → FloodGaugeForecast (Fase 2)
GET /weather/flood/events?lat=X&lng=Y&radiusKm=500  → FloodEvent[] (Fase 2)
GET /weather/flood/inundation?lat=X&lng=Y&radiusKm=50 → InundationPolygons (Fase 3)
```
Enquanto `source === 'mock'` → frontend exibe badge "Dados estimados — API pendente".
Quando `source === 'flood_hub'` → badge some, dados reais exibidos.

#### NavigationSafetyAssessment — campos novos (opcionais)
```typescript
// GET /weather/navigation-safety já retorna esses campos quando Flood Hub ativo
floodSeverity?: 'NO_FLOODING' | 'ABOVE_NORMAL' | 'SEVERE' | 'EXTREME';
hasFloodRisk?: boolean;
```

#### Tipos de Inundação (`floodHubTypes.ts`)
```typescript
type FloodRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface FloodInundationPolygon {
  id: string;
  risk: FloodRiskLevel;
  coordinates: {latitude: number; longitude: number}[];
}

interface FloodInundationData {
  polygons: FloodInundationPolygon[];
  source: FloodSource;
  lastUpdated: string;
}

const RISK_FILL: Record<FloodRiskLevel, string>   // rgba por risco
const RISK_STROKE: Record<FloodRiskLevel, string> // rgba por risco
```

#### Hook `useFloodInundation(lat, lng)`
- `useQuery` com `refetchInterval: 30min`, `staleTime: 25min`
- Coords arredondadas para ~1 km — evita refetch em cada pulso GPS
- Retorna `{inundation: FloodInundationData | null}`

#### Roadmap de implementação frontend
| Fase | Feature | Status |
|------|---------|--------|
| 1 | `FloodForecastPanel` na WeatherScreen | ✅ implementado |
| 1 | Tipos reais (`NO_FLOODING/ABOVE_NORMAL/SEVERE/EXTREME`) | ✅ implementado |
| 1 | `floodSeverity/hasFloodRisk` no NavigationSafetyAssessment | ✅ tipado |
| 2 | `Alert` de cheia pós-reserva na BookingScreen | ✅ implementado |
| 2 | Bloqueio 403 por cheia extrema no CaptainCreateTripScreen | ✅ implementado |
| 2 | Gráfico 7 dias no RiverDetailModal | ⏳ aguarda backend Fase 2 |
| 2 | Card de eventos graves na SafetyScreen | ⏳ aguarda backend Fase 2 |
| 3 | `useFloodInundation` — `GET /weather/flood/inundation` | ✅ implementado |
| 3 | `<Polygon>` no TrackingScreen (passageiro) | ✅ implementado |
| 3 | `<Polygon>` no CaptainTripLiveScreen (capitão) | ✅ implementado |

> **Nota Fase 3:** polígonos gateados em `source === 'flood_hub'` — zero impacto visual enquanto API Key não aprovada (backend retorna array vazio com `source: 'mock'`)

---

### Sistema de Clima — Funcionalidades completas (v5.9+)

#### WeatherWidget (HomeScreen + TrackingScreen)
- Temperatura atual, sensação térmica, condição, ícone
- Grid de detalhes: umidade, vento, nebulosidade
- **Linha adicional**: pressão atmosférica (hPa) + visibilidade (`formatVisibility`) + descrição
- **Linha nascer/pôr do sol**: incluindo **UV Index** colorido (`UV_LEVEL_CONFIGS[getUvLevel(uvIndex)]`)
- `uvIndex: number | null` — null em planos gratuitos da OpenWeatherMap

#### TripWeatherWidget (TripDetailsScreen / TripLive)
- Header: origem → destino + data/hora de partida
- Cards de resumo por trecho (clima atual + previsão de chegada)
- RiverLevelsPanel: nível atual, variação, tendência para rios amazônicos

#### WeatherAlertCard (`src/components/WeatherAlertCard/`)
- **Prop `compact`**: banner compacto com ícone + evento + headline (HomeScreen)
- **Variant completo**: evento, badge de severidade, headline, descrição, período
- 4 severidades com cores: info(azul) / warning(amarelo) / severe(laranja) / extreme(vermelho)

#### WeatherScreen
- Alertas ativos ordenados por severidade (extreme → info)
- Previsão de 7 dias: `tempMin`/`tempMax`/`tempAvg` + `precipitation` (mm) + probabilidade (%)
- Pull-to-refresh atualiza clima + alertas da região
- Dados do `WeatherForecastDay`: `tempAvg`, `precipitation`, `precipitationProbability`

#### HomeScreen — Banner de alerta
- Mostra apenas alertas `severe` ou `extreme` (não polui o feed com alertas menores)
- Ordenados por severidade: extreme aparece antes de severe
- `useWeatherAlerts` + `fetchRegionAlerts(region)` carregado no `loadData()`

#### Tipos de UV (`UvLevel` + `UV_LEVEL_CONFIGS` em `weatherTypes.ts`)
```typescript
export type UvLevel = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';
export function getUvLevel(index: number): UvLevel { ... }
export const UV_LEVEL_CONFIGS: Record<UvLevel, { label, emoji, color }> = { ... };
```

### Domínio Location (`src/domain/App/Location/`)

#### Estrutura de arquivos
```
Location/
  locationTypes.ts   — CepResult, City, LocationLabel, ReverseGeocode, AM_CITIES_FALLBACK
  locationAPI.ts     — getCep, getCities, getLocationLabel, getReverseGeocode
  locationService.ts — cache: cidades 24h, label 30min por coords
  useCases/
    useCepLookup.ts      — lookup(cep: string) → auto-fill endereço
    useCities.ts         — API + fallback estático; retorna cityNames: string[]
    useLocationLabel.ts  — fetchLabel(lat, lng) → string de label humanizado
    index.ts
  index.ts
```

#### Uso dos hooks
```typescript
// useCities — cidades do AM via API com fallback
const {cityNames, isLoading} = useCities();
// cityNames: string[] — nomes das cidades (para dropdowns)

// useCepLookup — autocomplete de endereço por CEP
const {result: cepResult, lookupCep, isLoading: isCepLoading} = useCepLookup();
// Chama lookupCep(cep) quando cep.length === 8 → preenche logradouro, bairro, cidade

// useLocationLabel — label humano para coordenadas GPS
const {label: locationLabel, fetchLabel} = useLocationLabel();
// fetchLabel(lat, lng) → locationLabel como "Rio Negro - Manaus, AM"
```

#### Endpoints da API (backend)
```
GET /locations/cep/:cep            — lookup de CEP (8 dígitos)
GET /locations/cities              — cidades do AM (default)
GET /locations/cities/:uf          — cidades de outro estado
GET /locations/location-label?lat=&lng=   — label humanizado
GET /locations/reverse-geocode?lat=&lng=  — geocodificação reversa completa
```

#### Integração nas telas
- **CreateShipmentScreen**: campo CEP antes do endereço; ícone muda (loading → check → pin); auto-preenche `recipientAddress`
- **CaptainCreateTripScreen**: dropdown de cidades usa API com fallback a lista estática `AM_CITIES`
- **TrackingScreen**: `useLocationLabel` exibe posição atual do barco em texto ("Rio Solimões - Parintins, AM")

### Sistema de Notificações Push (FCM)

#### 17 tipos de notificação tratados em `Router.tsx`:
| Tipo | Ação |
|------|------|
| `booking_confirmed` | navega para Ticket |
| `trip_started` | navega para Tracking |
| `trip_completed` | navega para TripReview |
| `check_in_available` | navega para Ticket |
| `booking_cancelled` | navega para Bookings |
| `shipment_created` | navega para ShipmentDetails |
| `shipment_collected` | navega para ShipmentDetails |
| `shipment_in_transit` | navega para ShipmentDetails |
| `shipment_arrived` | navega para ShipmentDetails |
| `shipment_out_for_delivery` | navega para ShipmentDetails |
| `shipment_delivered` | navega para ShipmentReview |
| `payment_confirmed` | navega para Ticket |
| `sos_alert` | navega para SosAlert |
| `weather_alert` | navega para WeatherScreen |
| `gamification_level_up` | navega para Gamification |
| `gamification_coins_earned` | navega para Gamification |
| `captain_verified` | navega para CaptainDashboard |

#### NotificationsScreen
- Lê histórico de AsyncStorage (máx 100 notificações)
- Badge de não-lidas em tempo real
- Tap em notificação → navega para tela correta + marca como lida
- `notificationsService.ts`: `registerPushToken()` / `unregisterPushToken()`

### Sistema de Reviews — Fluxo completo (padrão Uber)
- **"Conta bloqueada ou não encontrada"** → limpa tokens + toast de erro (6s) + logout imediato. Não tenta refresh.
- **Qualquer outro 401** → tenta refresh automático. Se falhar → logout silencioso.
- Fonte: `src/api/apiClient.ts` linhas 87–103.

### Notas sobre `src/api/config.ts`
Os endpoints em `config.ts` estão **incompletos** — os domínios (Safety, Weather, Favorites, Coupons, Promotions, Shipments, Captain) definem seus próprios caminhos de API diretamente nas classes `*API.ts`. Endpoints de gamificação (`GAMIFICATION_STATS/HISTORY/LEADERBOARD`) estão em `config.ts` e o domínio já está implementado em `src/domain/App/Gamification/`.

---

## ❌ O QUE FALTA IMPLEMENTAR (Priorizado)

### 🔴 CRÍTICO — Priority 1

#### 1. Admin Module — Endpoints faltantes
```
GET  /admin/users              — Listar todos usuários (paginação + filtros)
GET  /admin/users/stats        — Estatísticas de usuários
GET  /admin/users/:id          — Detalhes completos de um usuário
PATCH /admin/users/:id/role   — Alterar role (passenger → captain → admin)
PATCH /admin/users/:id/status — Ativar/desativar usuário
DELETE /admin/users/:id        — Deletar usuário

GET  /admin/trips              — Listar TODAS as viagens (paginação + filtros)
GET  /admin/trips/stats        — Estatísticas de viagens
PATCH /admin/trips/:id/status — Admin alterar status de qualquer viagem

GET  /admin/shipments          — Listar TODAS as encomendas (paginação + filtros)
GET  /admin/shipments/stats    — Estatísticas de encomendas
PATCH /admin/shipments/:id/status — Admin alterar status manualmente

GET  /admin/dashboard/overview — Overview geral (KPIs principais)
GET  /admin/dashboard/revenue  — Faturamento (hoje, semana, mês)
```

#### 2. Validações de segurança em Trips
```typescript
// Em trips.service.ts — método startTrip / updateStatus para IN_PROGRESS:
// ❌ Não valida clima antes de iniciar
// ❌ Não valida checklist completo antes de iniciar
// ❌ Não valida se data de partida é futura (createTrip)
// ❌ Não valida se capitão é dono da embarcação
// ❌ Não valida conflito de horário da embarcação
// ❌ Não valida se totalSeats <= capacidade da embarcação
```

### 🟠 IMPORTANTE — Priority 2

#### 3. Integração clima → iniciar viagem
O `WeatherService` existe e está funcional. Precisa ser chamado em `trips.service.ts` antes de mudar status para `IN_PROGRESS`.

#### 4. Integração gamification → entrega de shipment
O `GamificationService` existe. Precisa ser chamado quando shipment muda para `DELIVERED`.

#### 5. Reviews — verificar e completar
Verificar se o módulo de avaliações está completo e integrado com bookings/shipments.

### 🟡 DESEJÁVEL — Priority 3 (Backend)

#### 6. Paginação em listagens do admin
Todas as listagens admin devem ter paginação: `?page=1&limit=20`

#### 7. Validação de formato de datas
Garantir que `arrivalTime > departureTime` em todas as validações.

---

### 📱 APP MOBILE — O QUE FALTA

#### ~~M1. Gamificação~~ ✅ IMPLEMENTADO
`src/domain/App/Gamification/` completo: `gamificationAPI.ts`, `gamificationTypes.ts`, 3 hooks (`useGamificationStats`, `useGamificationHistory`, `useLeaderboard`). `GamificationScreen.tsx` com card de pontos/nível/progress bar e tabs Histórico/Ranking. Acesso via "NavegaCoins" no ProfileScreen.

#### ~~M2. Push Notifications (FCM)~~ ✅ IMPLEMENTADO
`@react-native-firebase/messaging` instalado. `google-services.json` em `android/app/`. Gradle configurado. `src/services/notificationsService.ts` com `registerPushToken()` / `unregisterPushToken()`. Histórico local em AsyncStorage (100 itens). `NotificationsScreen.tsx` exibe notificações reais com navegação por tipo. 17 tipos tratados em `Router.tsx`. **Rebuild necessário**: `cd android && ./gradlew clean && npx react-native run-android`.

#### ~~M3. Reviews pós-viagem~~ ✅ IMPLEMENTADO
`TripReviewScreen.tsx`: formulário progressivo (nota geral → detalhes: Pontualidade, Comunicação, Limpeza, Conforto). `ShipmentReviewScreen.tsx`: avalia entrega geral + pontualidade + comunicação. `MyReviewsScreen.tsx`: tabs "Dadas" / "Recebidas". Botão "Avaliar" no `BookingsScreen`.

#### ~~M4. Pagamento~~ ✅ IMPLEMENTADO
`PaymentMethodsScreen.tsx` + `AddCardScreen.tsx`. Domínio `PaymentMethod` com `paymentMethodAPI.ts` + 4 hooks: `usePaymentMethods`, `useAddPaymentMethod`, `useDeletePaymentMethod`, `useSetDefaultPaymentMethod`.

#### ~~M5. Sistema de Clima completo~~ ✅ IMPLEMENTADO
`WeatherScreen.tsx`, `WeatherAlertCard`, alertas na HomeScreen (severe/extreme), UV index, pressão, visibilidade, `RiverLevelsPanel`, `TripWeatherWidget` com origem→destino.

#### ~~M6. Domínio Location~~ ✅ IMPLEMENTADO
`useCepLookup` (autocomplete em CreateShipmentScreen), `useCities` (dropdown em CaptainCreateTripScreen com fallback), `useLocationLabel` (posição do barco em texto no TrackingScreen).

#### ~~M7. Armazenamento seguro de tokens~~ ✅ IMPLEMENTADO
`react-native-keychain` — JWT armazenado no Keychain/Keystore do dispositivo (não em AsyncStorage).

#### 🟠 DESEJÁVEL — Mobile Priority 1

#### M8. Filtros avançados de busca
`SearchScreen.tsx` / `SearchResultsScreen.tsx` — busca básica por origem/destino. Faltam filtros: data, faixa de preço, tipo de embarcação, amenidades.

#### M9. `src/api/config.ts` — Sincronizar endpoints faltantes
Os domínios usam caminhos hardcoded nas classes `*API.ts`. `config.ts` está desatualizado — mas não bloqueia nada pois cada domínio define sua própria URL.

#### 🟡 DESEJÁVEL — Mobile Priority 2

#### M10. Analytics / Crash Reporting
Sem Sentry (crash reports) nem Firebase Analytics (eventos de usuário).

#### M11. Compressão de imagens
`PhotoPicker.tsx` usa Image Picker mas sem compressão antes do upload S3. Fotos grandes podem causar timeouts.

---

## 🔗 DEPENDÊNCIAS CIRCULARES (IMPORTANTE)

Trips e Shipments têm dependência circular. **Sempre usar forwardRef():**

```typescript
// trips.module.ts
imports: [
  forwardRef(() => ShipmentsModule),
  forwardRef(() => GamificationModule),
]

// shipments.module.ts
imports: [
  forwardRef(() => TripsModule),
  forwardRef(() => GamificationModule),
]
```

Se criar um novo módulo que precise de outro já existente e vice-versa, use `forwardRef()` nos dois lados.

---

## 🌦️ WEATHER SERVICE

Já implementado e funcional. Endpoints públicos (`@Public()`):

```
GET /weather/current?lat=-3.119&lng=-60.0217&region=Manaus
GET /weather/region/manaus
GET /weather/forecast?lat=-3.119&lng=-60.0217
GET /weather/navigation-safety?lat=-3.119&lng=-60.0217
GET /weather/regions
```

Para usar em outro service:
```typescript
constructor(
  @Inject(forwardRef(() => WeatherService))
  private weatherService: WeatherService,
) {}

const safety = await this.weatherService.evaluateNavigationSafety(lat, lng);
if (safety.safetyScore < 50) {
  throw new BadRequestException(`Condições climáticas perigosas. Score: ${safety.safetyScore}/100`);
}
```

---

## 🔒 VARIÁVEIS DE AMBIENTE (.env)

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=navegaja_db

JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development

OPENWEATHER_API_KEY=sua-chave-openweathermap

# Google Flood Hub — adicionar quando aprovação chegar
# GOOGLE_FLOOD_HUB_API_KEY=sua-chave-flood-hub
```

---

## 👤 USUÁRIOS DE TESTE

| Email | Senha | Role |
|-------|-------|------|
| admin@navegaja.com | admin123 | admin |
| suporte@navegaja.com | admin123 | admin |
| captain@navegaja.com | admin123 | captain |

**Login web (dashboard):**
```bash
curl -X POST http://localhost:3000/auth/login-web \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@navegaja.com","password":"admin123"}'
```

**Login mobile (app):**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"92991234567","password":"senha123"}'
```

---

## 🚨 REGRAS INVIOLÁVEIS

1. **SEMPRE ler o arquivo existente antes de editar** — nunca sobrescrever sem entender o código atual
2. **NUNCA usar IDs numéricos** — sempre UUIDs
3. **NUNCA retornar senha do usuário** — remover `passwordHash` de qualquer response
4. **SEMPRE validar ownership** — usuário só pode editar/deletar seus próprios recursos
5. **SEMPRE usar DTOs com class-validator** — nunca acessar `req.body` diretamente
6. **TypeScript strict** — sem `any` desnecessário, tipar tudo corretamente
7. **Dependências circulares** — sempre resolver com `forwardRef()`
8. **Não quebrar endpoints existentes** — adicionar, nunca remover sem motivo
9. **`synchronize: true`** está ativo em dev — TypeORM cria/altera tabelas automaticamente

---

## 📋 CHECKLIST ANTES DE FINALIZAR QUALQUER IMPLEMENTAÇÃO

- [ ] Código compila sem erros TypeScript (`yarn build`)
- [ ] DTOs têm validações com class-validator
- [ ] Guards corretos aplicados (JwtAuthGuard + RolesGuard onde necessário)
- [ ] Endpoints públicos têm `@Public()` decorator
- [ ] Ownership verificado (usuário não pode acessar dados de outros)
- [ ] Senhas não retornadas em nenhuma response
- [ ] IDs sempre UUID (validados com `@IsUUID()`)
- [ ] Módulo atualizado com novo service/controller no providers[]
- [ ] Module exporta service se outro módulo precisar usar

---

## 🎯 COMO INICIAR UMA SESSÃO

1. Leia este arquivo por completo
2. Execute `find src -type f -name "*.ts" | head -50` para mapear o projeto
3. Leia os arquivos relevantes para a tarefa (`cat src/admin/admin.module.ts`, etc.)
4. Pergunte se algo não ficou claro antes de implementar
5. Implemente seguindo os padrões acima
6. Execute `yarn build` para confirmar que não há erros
7. Teste os endpoints criados

---

## 📌 DOCUMENTOS DE REFERÊNCIA NO PROJETO

| Arquivo | Conteúdo |
|---------|----------|
| `PROJECT_OVERVIEW.md` | Visão geral completa da arquitetura |
| `ENDPOINTS_SPEC.md` | Spec de todos os endpoints existentes |
| `SHIPMENTS_COMPLETE_SPEC.md` | Spec detalhada do sistema de encomendas |
| `DASHBOARD_ADMIN_STATUS.md` | Status atual do dashboard admin + gaps |
| `WEB_ADMIN_SPECS.md` | Especificação completa do dashboard Next.js |
| `MOBILE_APP_SPEC.md` | Especificação do app mobile |
| `PROMOTIONS_GUIDE.md` | Sistema de promoções e banners |
| `WEATHER_MOBILE_INTEGRATION.md` | Integração clima no app |
| `SAFETY_SYSTEM_GUIDE.md` | Sistema de segurança (SOS, checklists) |
| `SHIPMENT_FLOW.md` | Fluxo completo de encomendas |
| `GUIA_FRONTEND_IMPLEMENTACAO.md` | Guia frontend (mobile + web) |
| `PERGUNTAS_RESPOSTAS.md` | Gap analysis detalhado do projeto |

---

## 🚀 PRÓXIMA TAREFA SUGERIDA

### Backend — ordem de prioridade:
1. **`GET /admin/users`** com paginação e filtros
2. **`GET /admin/users/stats`** com totais por role
3. **`GET /admin/trips`** com paginação e filtros
4. **`GET /admin/trips/stats`** com totais por status
5. **`GET /admin/shipments`** com paginação e filtros
6. **`GET /admin/dashboard/overview`** com KPIs gerais
7. **Validações em `trips.service.ts`** (datas, capacidade, ownership da embarcação)
8. **Integração clima em `startTrip`** (chamar WeatherService antes de IN_PROGRESS)

### App Mobile — ordem de prioridade:
1. **Filtros avançados de busca** — data, preço, tipo de embarcação, amenidades
2. **Flood Hub Fase 2 restante** — gráfico 7 dias no RiverDetailModal + card de eventos na SafetyScreen (quando backend entregar endpoints `/flood/gauge/:id/forecast` e `/flood/events`)
3. **Analytics / Crash Reporting** — Sentry ou Firebase Analytics
4. **Compressão de imagens** — antes do upload S3

---

## 🧩 COMPONENTES REUTILIZÁVEIS (exportados de `@components`)

| Componente | Props principais | Uso |
|------------|-----------------|-----|
| `UserAvatar` | `userId?`, `avatarUrl?`, `name?`, `size?` (xs/sm/md/lg/xl) | Toda tela que exibe avatar de usuário |
| `AvatarEditorModal` | `visible`, `currentAvatarUrl?`, `userName?`, `onConfirm(url)`, `onClose` | EditProfileScreen |
| `PhotoPicker` | `photos`, `onPhotosChange`, `maxPhotos?=5` | Upload de múltiplas fotos |
| `WeatherWidget` | `region?`, `latitude?`, `longitude?`, `onPress?` | HomeScreen, TrackingScreen — exibe skeleton durante loading |
| `WeatherAlertCard` | `alert: WeatherAlert`, `compact?` | HomeScreen (compact), WeatherScreen (full) |
| `TripWeatherWidget` | `tripWeather: TripWeather` | TripDetailsScreen, CaptainTripLive |
| `RiverLevelsPanel` | _(sem props — faz próprio fetch)_ | WeatherScreen — exibe skeleton durante loading |
| `FloodForecastPanel` | `lat: number`, `lng: number`, `radiusKm?=50` | WeatherScreen — alertas Flood Hub; badge "estimados" enquanto `source==='mock'` |
| `ConfirmationModal` | `visible`, `title`, `message`, `icon?`, `iconColor?`, `confirmText?`, `cancelText?`, `onConfirm`, `onCancel`, `isLoading?` | Qualquer confirmação destrutiva |

### Skeletons disponíveis (`@components` → `Skeleton.tsx`)
| Skeleton | Uso |
|----------|-----|
| `Skeleton` | Base (width, height, borderRadius, animate) |
| `TripCardSkeleton` | Cards de viagem em listas |
| `TripListSkeleton` | Lista de cards (prop `count`) |
| `TripDetailsSkeleton` | Tela de detalhes da viagem |
| `BookingCardSkeleton` | Cards de reserva |
| `ShipmentCardSkeleton` | Cards de encomenda |
| `WeatherWidgetSkeleton` | Widget de clima atual (header + temp + grid + pressão + UV) |
| `ForecastCardSkeleton` | Card 110px para previsão horizontal |
| `RiverLevelsSkeleton` | Painel de nível de rios (prop `count`) |
| `WeatherAlertCardSkeleton` | Card de alerta meteorológico |

### UserAvatar — Render priority:
1. DiceBear URL (`https://api.dicebear.com/9.x/{style}/svg?seed=...`) → renderizado localmente via SVG
2. Foto real (URL http/https com imagem real)
3. Fallback: avatar SVG local com iniciais

### AvatarEditorModal — 12 estilos DiceBear disponíveis:
`avataaars`, `micah`, `lorelei`, `adventurer`, `open-peeps`, `personas`, `notionists`, `bottts`, `pixel-art`, `fun-emoji`, `thumbs`, `initials`

---

## 🧪 TESTES UNITÁRIOS

### Suítes existentes (217 testes, 16 suítes)

| Arquivo de teste | O que cobre |
|-----------------|-------------|
| `utils/cpfValidator.test.ts` | Validação de CPF |
| `utils/phoneMask.test.ts` | Máscara de telefone |
| `utils/formatBRL.test.ts` | Formatação de moeda BRL |
| `hooks/useVirtualPagination.test.ts` | Paginação virtual |
| `api/normalizeFileUrl.test.ts` | Normalização de URLs de imagem |
| `screens/useBookingsScreen.test.ts` | Filtros, badges, cancelamento, navegação |
| `domain/gamificationService.test.ts` | Transformação de histórico, leaderboard |
| `domain/locationService.test.ts` | Cache AsyncStorage (24h cities, 30min label), fallback |
| `domain/useCepLookup.test.ts` | Lookup CEP, validação 8 dígitos, limpeza de máscara, error |
| `domain/useCities.test.ts` | Carregamento, fallback offline, cityNames derivado |
| `domain/useLocationLabel.test.ts` | fetchLabel, falha silenciosa, clear |
| `domain/useWeatherAlerts.test.ts` | fetchAlerts (lat/lng), fetchRegionAlerts, error state |
| `domain/paymentMethodService.test.ts` | Normalização cardNumber/holderName, getAll, setDefault, remove |

### Padrão de testes de service
```typescript
import {myService} from '../../domain/App/Domain/myService';
import {myAPI} from '../../domain/App/Domain/myAPI';

jest.mock('../../domain/App/Domain/myAPI');
const mockAPI = myAPI as jest.Mocked<typeof myAPI>;

describe('myService.method', () => {
  beforeEach(() => jest.clearAllMocks());
  it('...', async () => { ... });
});
```

### Padrão de testes de hook (useState pattern)
```typescript
import {renderHook, act} from '@testing-library/react-native';
import {useMyHook} from '../../domain/App/Domain/useCases/useMyHook';
import {myService} from '../../domain/App/Domain/myService';

jest.mock('../../domain/App/Domain/myService');
const mockService = myService as jest.Mocked<typeof myService>;

it('...', async () => {
  mockService.method.mockResolvedValue(data);
  const {result} = renderHook(() => useMyHook());
  await act(async () => { await result.current.doSomething(); });
  expect(result.current.state).toEqual(data);
});
```

### Limitação conhecida
- Hooks que usam `@tanstack/react-query` (`useMyCards`, `useAddCard`, etc.) requerem wrapper com `QueryClient` — testados via `paymentMethodService.test.ts` em vez de hooks.
- `@dicebear/core` não tem mock Jest — testes de componentes que importam `UserAvatar` falham (16 testes pré-existentes ignorados no CI).

---

## 🔑 PADRÕES CRÍTICOS DO APP (NUNCA VIOLAR)

### Restyle — Tokens de borda e espaçamento
```typescript
// ✅ borderRadius válidos: s8, s12, s16, s20, s24, s48
<Box borderRadius="s16" />
// ❌ s4 NÃO existe → usar style
<Box style={{borderRadius: 4}} />

// ✅ spacing começa em s4
<Box padding="s4" />
// ❌ s2 NÃO existe
```

### Restyle — Cores dinâmicas (hex)
```typescript
// ✅ Hex dinâmico → sempre via style
<Box style={{backgroundColor: '#FF5733'}} />
// ❌ NUNCA como prop Restyle direta
<Box backgroundColor="#FF5733" />  // TS error

// Icon com hex:
<Icon name="star" color={hexColor as any} />
```

### Imagens — Normalização de URL
```typescript
// ✅ Sempre usar apiImageSource para <Image>
<Image source={apiImageSource(url)} />
// ✅ Sempre usar normalizeFileUrl ao guardar estado
setAvatarUrl(normalizeFileUrl(responseUrl));
// ❌ NUNCA fazer manualmente
const src = url.startsWith('http') ? url : API_BASE_URL + url; // buggy
```

### Toast — API correta
```typescript
// ✅ useToast()
const {showSuccess, showError, showWarning, showInfo} = useToast();
showSuccess('Mensagem');
// ❌ NÃO existe
toast.show({message, preset});
```

### Domínio — Estrutura obrigatória
```
App/DomainName/
  domainAPI.ts      — api.get/post/patch/delete
  domainTypes.ts    — interfaces e enums
  domainService.ts  — (opcional) cache/transformações
  index.ts          — barrel export
  useCases/
    useActionName.ts   — hook com estado (useState pattern)
    index.ts
```
**SEMPRE** exportar o novo domínio em `src/domain/App/index.ts`.

---

*Prompt gerado em: 19/02/2026 | Atualizado: 26/02/2026 | Versão: 4.3 | Projeto: NavegaJá Full Stack*