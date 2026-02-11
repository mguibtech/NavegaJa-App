# 🏛️ Arquitetura Domain-Driven Design (DDD)

Estrutura completa implementada seguindo **Domain-Driven Design** e **Clean Architecture**.

## 📁 Estrutura Completa

```
src/domain/
├── Auth/                        # Domínio de Autenticação
│   ├── useCases/               # Casos de uso (hooks)
│   │   ├── useLogin.ts
│   │   ├── useRegister.ts
│   │   ├── useLogout.ts
│   │   ├── useForgotPassword.ts
│   │   ├── useAuthUser.ts
│   │   └── index.ts
│   ├── authTypes.ts            # Interfaces, enums, types
│   ├── authAPI.ts              # Chamadas HTTP (class)
│   ├── authService.ts          # Lógica de negócio (class)
│   └── index.ts                # Exports centralizados
│
└── App/                        # Domínio do Aplicativo
    ├── Trip/                   # Contexto de Viagens
    │   ├── useCases/
    │   │   ├── useSearchTrips.ts
    │   │   ├── useTripDetails.ts
    │   │   └── index.ts
    │   ├── tripTypes.ts
    │   ├── tripAPI.ts
    │   ├── tripService.ts
    │   └── index.ts
    │
    ├── Booking/                # Contexto de Reservas
    │   ├── useCases/
    │   │   ├── useMyBookings.ts
    │   │   ├── useCreateBooking.ts
    │   │   └── index.ts
    │   ├── bookingTypes.ts
    │   ├── bookingAPI.ts
    │   ├── bookingService.ts   # Com offline-first
    │   └── index.ts
    │
    └── index.ts
```

## 🎯 Camadas da Arquitetura

### 1️⃣ **Types** (xxxTypes.ts)
Define interfaces, enums e tipos do domínio.

```typescript
// domain/Auth/authTypes.ts
export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  PASSENGER = 'passenger',
  CAPTAIN = 'captain',
}

export interface LoginRequest {
  phone: string;
  password: string;
}
```

### 2️⃣ **API** (xxxAPI.ts)
Chamadas HTTP puras, sem lógica de negócio.

```typescript
// domain/Auth/authAPI.ts
class AuthAPI {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }
}

export const authAPI = new AuthAPI();
```

### 3️⃣ **Service** (xxxService.ts)
Lógica de negócio, orquestração, transformação de dados.

```typescript
// domain/Auth/authService.ts
class AuthService {
  async login(credentials: LoginRequest): Promise<User> {
    const response = await authAPI.login(credentials);

    // Lógica de negócio
    await authStorage.saveToken(response.token);
    await authStorage.saveUser(response.user);

    return response.user;
  }
}

export const authService = new AuthService();
```

### 4️⃣ **Use Cases** (useCases/useXxx.ts)
Hooks customizados que orquestram API + Service + Estado.

```typescript
// domain/Auth/useCases/useLogin.ts
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function login(credentials: LoginRequest): Promise<User | null> {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(credentials);
      setIsLoading(false);
      return user;
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      throw err;
    }
  }

  return { login, isLoading, error };
}
```

## 🚀 Como Usar

### Exemplo 1: LoginScreen

```typescript
import React, {useState} from 'react';
import {Alert} from 'react-native';

import {Box, Button, TextInput} from '@components';
import {useLogin, useAuthUser} from '@domain/Auth';
import {formatPhone, unformatPhone} from '@utils';
import {useToast} from '@hooks';

export function LoginScreen() {
  const {login, isLoading} = useLogin();
  const {updateUser} = useAuthUser();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      const user = await login({
        phone: unformatPhone(phone),
        password,
      });

      updateUser(user);
      toast.showSuccess('Bem-vindo ao NavegaJá!');
    } catch (error) {
      toast.showError('Telefone ou senha incorretos');
    }
  }

  return (
    <Box flex={1} p="s24">
      <TextInput
        label="Celular"
        value={phone}
        onChangeText={text => setPhone(formatPhone(text))}
        keyboardType="phone-pad"
      />
      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Entrar"
        onPress={handleLogin}
        loading={isLoading}
      />
    </Box>
  );
}
```

### Exemplo 2: SearchTripsScreen

```typescript
import React, {useState} from 'react';

import {Box, Button, TextInput} from '@components';
import {useSearchTrips} from '@domain/App/Trip';
import {useToast} from '@hooks';

export function SearchTripsScreen() {
  const {trips, search, isLoading} = useSearchTrips();
  const toast = useToast();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  async function handleSearch() {
    try {
      await search({origin, destination});

      if (trips.length === 0) {
        toast.showInfo('Nenhuma viagem encontrada');
      }
    } catch (error) {
      toast.showError('Erro ao buscar viagens');
    }
  }

  return (
    <Box flex={1} p="s24">
      <TextInput
        label="Origem"
        value={origin}
        onChangeText={setOrigin}
      />
      <TextInput
        label="Destino"
        value={destination}
        onChangeText={setDestination}
      />
      <Button
        title="Buscar"
        onPress={handleSearch}
        loading={isLoading}
      />

      {/* Lista de trips */}
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </Box>
  );
}
```

### Exemplo 3: MyBookingsScreen (com Offline-First)

```typescript
import React, {useEffect} from 'react';

import {Box, Text} from '@components';
import {useMyBookings} from '@domain/App/Booking';

export function MyBookingsScreen() {
  const {bookings, fetch, isLoading} = useMyBookings();

  useEffect(() => {
    // Load from API
    fetch();
  }, []);

  // bookings são carregados do AsyncStorage imediatamente
  // e depois atualizados com dados da API

  return (
    <Box flex={1} p="s24">
      {bookings.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </Box>
  );
}
```

## 📝 Convenções de Nomenclatura

### Types
- Interface: `User`, `Trip`, `Booking`
- Enum: `UserRole`, `TripStatus`, `BookingStatus`
- Request/Response: `LoginRequest`, `AuthResponse`

### Arquivos
- Types: `authTypes.ts`, `tripTypes.ts`
- API: `authAPI.ts`, `tripAPI.ts`
- Service: `authService.ts`, `tripService.ts`

### Use Cases
- Padrão: `use` + `Ação` + `Contexto`
- Exemplos:
  - `useLogin` - Fazer login
  - `useSearchTrips` - Buscar viagens
  - `useMyBookings` - Minhas reservas
  - `useCreateBooking` - Criar reserva
  - `useTripDetails` - Detalhes da viagem

## 🔄 Fluxo de Dados

```
Screen/Component
    ↓
useCase (Hook)
    ↓
Service (Business Logic)
    ↓
API (HTTP Call)
    ↓
Backend
```

## ✅ Vantagens

### 1. **Separação de Responsabilidades**
- API: apenas HTTP
- Service: lógica de negócio
- UseCase: estado + orquestração
- Types: contratos

### 2. **Testabilidade**
- Cada camada pode ser testada independentemente
- Fácil mockar APIs e Services

### 3. **Reutilização**
- UseCases podem ser usados em múltiplas telas
- Services podem ser chamados fora de componentes

### 4. **Escalabilidade**
- Fácil adicionar novos domínios
- Estrutura consistente

### 5. **Manutenibilidade**
- Código organizado por contexto de negócio
- Fácil encontrar e alterar

## 🎯 Próximos Passos

1. **Adicionar mais domínios**:
   ```
   domain/App/
   ├── Shipment/
   ├── Route/
   ├── User/
   ├── Captain/
   └── Review/
   ```

2. **Implementar patterns**:
   - Repository Pattern (para cache/offline)
   - Observer Pattern (para sync real-time)
   - Factory Pattern (para criar instâncias)

3. **Adicionar testes**:
   ```typescript
   describe('useLogin', () => {
     it('should login successfully', async () => {
       // test
     });
   });
   ```

---

**Arquitetura DDD implementada! 🎉**
Clean, escalável e profissional.
