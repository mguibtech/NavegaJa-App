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

### Telas implementadas (46 telas)

| Área | Telas | Status |
|------|-------|--------|
| Auth | Login, Register, ForgotPassword, ResetPassword | ✅ 100% |
| Onboarding | Onboarding, Splash (animado) | ✅ 100% |
| Home & Busca | Home, Search, SearchResults, PopularRoutes | ✅ 100% |
| Reservas | Booking, Bookings (lista), Payment, PaymentMethods, Ticket, Tracking | ✅ 100% |
| Encomendas | CreateShipment, Shipments, ShipmentDetails, ShipmentReview, ScanQR, ValidateDelivery | ✅ 100% |
| Perfil & Segurança | Profile, EditProfile, Favorites, EmergencyContacts, SOS, Notifications, Help | ✅ 100% |
| Legal | Terms, Privacy | ✅ 100% |
| Capitão — Viagens | Dashboard, MyTrips, CreateTrip, StartTrip, TripManage, TripLive (Google Maps) | ✅ 100% |
| Capitão — Checklist | CaptainChecklist (8 itens pré-partida) | ✅ 100% |
| Capitão — Embarcações | MyBoats, CreateBoat, EditBoat | ✅ 100% |
| Capitão — Financeiro | Financial (ganhos), Operations, ShipmentCollect (QR) | ✅ 100% |
| Reviews de Viagem | TripReviewScreen, botão "Avaliar" no BookingsScreen | ✅ 100% |
| Visualização de Reviews | TripDetailsScreen (capitão + barco), ProfileScreen (recebidas) | ✅ 100% |
| Perfil do Capitão | CaptainProfileScreen — hero, stats, breakdown Pontualidade/Comunicação, todas as reviews | ✅ 100% |
| Detalhe da Embarcação | BoatDetailScreen — specs, comodidades, breakdown Limpeza/Conforto, todas as reviews | ✅ 100% |
| Gamificação | GamificationScreen — pontos, nível, barra de progresso, histórico, ranking | ✅ 100% |

### Domínios implementados (14 módulos)

| Domínio | Status | Observação |
|---------|--------|------------|
| Auth (login, register, refresh, forgot/reset) | ✅ 100% | |
| Trip (search, details, popular routes) | ✅ 100% | |
| Booking (create, list, track, check-in, cancel) | ✅ 100% | PIX com QR code |
| Shipment (8 estados, QR, tracking, foto, reviews) | ✅ 100% | Presigned S3 URLs |
| Captain (trips, boats, earnings, checklist) | ✅ 100% | |
| Boat (CRUD completo) | ✅ 100% | |
| Route (search, popular) | ✅ 100% | |
| Safety (SOS 7 tipos, checklist, contatos emergência) | ✅ 100% | Geolocation com fallback |
| Weather (clima, previsão, safety assessment) | ✅ 100% | 12 regiões amazônicas |
| Review (criar, listar por capitão/viagem/barco, canReview, getMyReviews, captainReviewPassenger) | ✅ 100% | exibidas em TripDetailsScreen + ProfileScreen |
| Favorite (toggle, listar) | ✅ 100% | tipos: destination/boat/captain |
| Discount (cupom, cálculo de preço, loyalty) | ✅ 100% | |
| Promotion (banners, CTA, deep-link) | ✅ 100% | |
| Gamification (NavegaCoins, histórico, leaderboard) | ✅ 100% | GamificationScreen com tabs |

### Infraestrutura do app

| Item | Status |
|------|--------|
| Navegação (React Navigation 7.x + bottom tabs) | ✅ |
| Tema/Design System (Restyle 2.4.5) | ✅ |
| Estado global (Zustand 5.x) — auth, trip, booking, shipment, toast | ✅ |
| HTTP Client (Axios + interceptors JWT + refresh automático + conta bloqueada) | ✅ |
| Google Maps (react-native-maps) — rotas, marcadores, danger zones | ✅ |
| QR Code Scanning (Vision Camera 4.x) | ✅ |
| Upload de fotos (Image Picker + presigned S3) | ✅ |
| Geolocalização com estratégia de fallback (network → GPS → cache) | ✅ |
| Safe Area + Keyboard Avoiding em todos as telas | ✅ |
| Toast notifications (global) | ✅ |
| Formatação BRL (`formatBRL.ts`) | ✅ |
| Validação CPF + máscara telefone/email | ✅ |
| Push Notifications (FCM — @react-native-firebase/messaging) | ✅ Implementado |
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

### Interceptor HTTP — comportamento de 401
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

#### 🔴 CRÍTICO — Mobile Priority 1

#### ~~M1. Gamificação~~ ✅ IMPLEMENTADO
`src/domain/App/Gamification/` completo: `gamificationAPI.ts`, `gamificationTypes.ts`, 3 hooks (`useGamificationStats`, `useGamificationHistory`, `useLeaderboard`). `GamificationScreen.tsx` com card de pontos/nível/progress bar e tabs Histórico/Ranking. Acesso via "NavegaCoins" no ProfileScreen.

#### ~~M2. Push Notifications (FCM)~~ ✅ IMPLEMENTADO
`@react-native-firebase/messaging` instalado. `google-services.json` em `android/app/`. Gradle configurado. `src/services/notificationsService.ts` com `registerPushToken()` / `unregisterPushToken()`. Histórico local em AsyncStorage. `NotificationsScreen.tsx` exibe notificações reais com navegação por tipo. Listeners em `Router.tsx`. **Rebuild necessário**: `cd android && ./gradlew clean && npx react-native run-android`.

#### 🟠 IMPORTANTE — Mobile Priority 2

#### M3. `src/api/config.ts` — Sincronizar endpoints faltantes
Faltam no arquivo `config.ts` (os domínios usam caminhos hardcoded nas classes `*API.ts`):
```typescript
// Adicionar:
CAPTAIN_TRIPS: '/trips/captain/my-trips',
TRIP_PASSENGERS: (id: string) => `/trips/${id}/passengers`,
MY_SHIPMENTS: '/shipments/my-shipments',
SHIPMENT_BY_ID: (id: string) => `/shipments/${id}`,
FAVORITES: '/favorites',
COUPONS_VALIDATE: '/coupons/validate',
PROMOTIONS: '/promotions',
SAFETY_SOS: '/safety/sos',
SAFETY_CHECKLISTS: '/safety/checklists',
WEATHER_CURRENT: '/weather/current',
WEATHER_SAFETY: '/safety/weather-safety',
```

#### ~~M4. Tela de reviews pós-viagem~~ ✅ IMPLEMENTADO
`TripReviewScreen.tsx` criado com formulário progressivo: nota geral (obrigatória) → detalhes opcionais (Pontualidade, Comunicação, Limpeza, Conforto) revelados após nota geral. Botão "Avaliar Viagem" no `BookingsScreen`. `TripDetailsScreen` exibe breakdown de ratings (barra de progresso) + labels por review.

#### 🟡 DESEJÁVEL — Mobile Priority 3

#### M5. Filtros avançados de busca
`SearchScreen.tsx` / `SearchResultsScreen.tsx` — busca básica por origem/destino. Faltam filtros: data, faixa de preço, tipo de embarcação, amenidades.

#### M6. Analytics / Crash Reporting
Sem Sentry (crash reports) nem Firebase Analytics (eventos de usuário).

#### M7. Compressão de imagens
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
1. **Sincronizar `config.ts`** — centralizar endpoints hardcoded nas classes `*API.ts`
2. **Filtros avançados de busca** — data, preço, tipo de embarcação, amenidades
3. **Analytics / Crash Reporting** — Sentry ou Firebase Analytics

---

*Prompt gerado em: 19/02/2026 | Atualizado: 20/02/2026 | Versão: 3.7 | Projeto: NavegaJá Full Stack*