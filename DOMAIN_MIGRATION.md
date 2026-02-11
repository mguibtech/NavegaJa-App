# 🏗️ Migração para Arquitetura de Domínio

A estrutura do projeto foi reorganizada seguindo princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**.

## 📁 Nova Estrutura

```
src/
├── domain/
│   ├── auth/                    # Domínio de Autenticação
│   │   ├── authTypes.ts         # Types, enums, interfaces
│   │   ├── authApi.ts           # Chamadas HTTP
│   │   ├── authStore.ts         # Zustand store
│   │   └── index.ts             # Exports
│   │
│   ├── app/                     # Domínio do App
│   │   ├── trips/               # Viagens
│   │   │   ├── tripsTypes.ts
│   │   │   ├── tripsApi.ts
│   │   │   ├── tripsStore.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── bookings/            # Reservas
│   │   │   ├── bookingsTypes.ts
│   │   │   ├── bookingsApi.ts
│   │   │   ├── bookingsStore.ts (com offline-first)
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   └── index.ts                 # Export central
```

## ✅ Arquivos Criados

### Auth Domain
- ✅ `domain/auth/authTypes.ts` - User, UserRole, LoginRequest, RegisterRequest, AuthResponse
- ✅ `domain/auth/authApi.ts` - login, register, getMe, logout, forgotPassword, etc.
- ✅ `domain/auth/authStore.ts` - useAuthStore com todas as actions
- ✅ `domain/auth/index.ts` - Exports centralizados

### App Domain - Trips
- ✅ `domain/app/trips/tripsTypes.ts` - Trip, TripStatus, SearchTripsRequest
- ✅ `domain/app/trips/tripsApi.ts` - search, getById, create, update, delete
- ✅ `domain/app/trips/tripsStore.ts` - useTripsStore

### App Domain - Bookings
- ✅ `domain/app/bookings/bookingsTypes.ts` - Booking, BookingStatus, PaymentMethod
- ✅ `domain/app/bookings/bookingsApi.ts` - getMyBookings, create, cancel, checkIn
- ✅ `domain/app/bookings/bookingsStore.ts` - useBookingsStore (com offline-first AsyncStorage)

## 🔄 Como Atualizar Imports

### Antes (❌):
```typescript
import {useAuthStore} from '../store/auth.store';
import {UserRole} from '@types';
import {formatPhone} from '../../utils/phoneMask';
```

### Depois (✅):
```typescript
import {useAuthStore, UserRole} from '@domain/auth';
import {formatPhone} from '@utils';
```

## 🚀 Vantagens da Nova Arquitetura

### 1. **Separação por Domínio**
- Cada domínio (auth, trips, bookings) é independente
- Fácil de encontrar e manter

### 2. **Coesão**
- Types, API e Store ficam juntos no mesmo domínio
- Menos navegação entre pastas

### 3. **Escalabilidade**
- Fácil adicionar novos domínios (shipments, reviews, etc.)
- Estrutura consistente

### 4. **Imports Limpos**
```typescript
// Tudo do auth vem de um lugar
import {useAuthStore, User, UserRole, LoginRequest} from '@domain/auth';

// Tudo de trips vem de um lugar
import {useTripsStore, Trip, TripStatus} from '@domain/app/trips';
```

## 📝 Arquivos que Precisam ser Atualizados

Atualize os imports nesses arquivos:

- [ ] `src/screens/auth/LoginScreen.tsx`
- [ ] `src/screens/auth/RegisterScreen.tsx`
- [ ] `src/screens/auth/ForgotPasswordScreen.tsx`
- [ ] `src/routes/Router.tsx` ✅ (já atualizado)

## 🔧 Próximos Passos

1. **Adicionar mais domínios**:
   ```bash
   domain/app/
   ├── shipments/
   ├── routes/
   ├── boats/
   ├── reviews/
   └── captain/
   ```

2. **Remover pastas antigas** (após migração completa):
   ```bash
   src/store/       # Mover para domain
   src/api/         # Mover para domain (manter apenas apiClient.ts)
   src/types/       # Distribuir entre os domínios
   ```

## 📚 Exemplo Completo

```typescript
// LoginScreen.tsx
import React, {useState} from 'react';
import {Alert} from 'react-native';

import {Box, Button, TextInput} from '@components';
import {useAuthStore} from '@domain/auth';
import {formatPhone, unformatPhone} from '@utils';
import {useToast} from '@hooks';

export function LoginScreen() {
  const {login} = useAuthStore();
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await login({
        phone: unformatPhone(phone),
        password,
      });
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
      <Button title="Entrar" onPress={handleLogin} />
    </Box>
  );
}
```

---

**Estrutura implementada! 🎉** Agora o código está mais organizado e escalável.
