# 🏛️ Arquitetura DDD Modular - NavegaJá

Estrutura **ultra-modular** onde cada funcionalidade tem sua própria pasta com Types, API, Adapter e UseCase.

## 📁 Estrutura Completa

```
src/domain/
│
├── Auth/                           # Domínio de Autenticação
│   │
│   ├── Login/                      # 🔐 Funcionalidade: Login
│   │   ├── loginTypes.ts          # Interfaces (LoginRequest, LoginResponse)
│   │   ├── loginAPI.ts            # Chamada HTTP
│   │   ├── loginAdapter.ts        # Adapta resposta para User + Tokens
│   │   ├── useLogin.ts            # Hook customizado
│   │   └── index.ts               # Exports
│   │
│   ├── Register/                   # ✍️ Funcionalidade: Cadastro
│   │   ├── registerTypes.ts
│   │   ├── registerAPI.ts
│   │   ├── registerAdapter.ts
│   │   ├── useRegister.ts
│   │   └── index.ts
│   │
│   ├── ForgotPassword/             # 🔑 Funcionalidade: Esqueci a Senha
│   │   ├── forgotPasswordTypes.ts
│   │   ├── forgotPasswordAPI.ts
│   │   ├── useForgotPassword.ts
│   │   └── index.ts
│   │
│   ├── ResetPassword/              # 🔄 Funcionalidade: Redefinir Senha
│   │   ├── resetPasswordTypes.ts
│   │   ├── resetPasswordAPI.ts
│   │   ├── useResetPassword.ts
│   │   └── index.ts
│   │
│   ├── Logout/                     # 🚪 Funcionalidade: Sair
│   │   ├── logoutAPI.ts
│   │   ├── useLogout.ts
│   │   └── index.ts
│   │
│   ├── User/                       # 👤 Funcionalidade: Usuário Atual
│   │   ├── userTypes.ts           # User interface + UserRole enum
│   │   ├── userAPI.ts             # GET /auth/me
│   │   ├── useAuthUser.ts         # Hook para estado global do user
│   │   └── index.ts
│   │
│   └── index.ts                    # Export central do Auth
│
└── App/                            # Domínio do Aplicativo
    ├── Trip/
    ├── Booking/
    └── ...
```

## 🎯 Camadas (por Funcionalidade)

### 1️⃣ **Types** (xxxTypes.ts)
Interfaces da funcionalidade (Request/Response).

```typescript
// Login/loginTypes.ts
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: {...};
  token: string;
  refreshToken: string;
}
```

### 2️⃣ **API** (xxxAPI.ts)
Chamada HTTP pura (class singleton).

```typescript
// Login/loginAPI.ts
class LoginAPI {
  async execute(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  }
}

export const loginAPI = new LoginAPI();
```

### 3️⃣ **Adapter** (xxxAdapter.ts) ⭐ NOVO!
Transforma dados da API para o formato da aplicação.

```typescript
// Login/loginAdapter.ts
export const loginAdapter = {
  toUser(response: LoginResponse): User {
    return {
      id: response.user.id,
      name: response.user.name,
      role: response.user.role as UserRole,
      // ... adapta campos
    };
  },

  toTokens(response: LoginResponse) {
    return {
      token: response.token,
      refreshToken: response.refreshToken,
    };
  },
};
```

### 4️⃣ **UseCase** (useXxx.ts)
Hook que orquestra tudo: API → Adapter → Storage → State.

```typescript
// Login/useLogin.ts
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function login(credentials: LoginRequest): Promise<User> {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call API
      const response = await loginAPI.execute(credentials);

      // 2. Adapt response
      const user = loginAdapter.toUser(response);
      const {token, refreshToken} = loginAdapter.toTokens(response);

      // 3. Save to storage
      await authStorage.saveToken(token);
      await authStorage.saveRefreshToken(refreshToken);
      await authStorage.saveUser(user);

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
      // useLogin retorna User adaptado
      const user = await login({
        phone: unformatPhone(phone),
        password,
      });

      // Atualiza contexto global
      updateUser(user);

      toast.showSuccess(`Bem-vindo, ${user.name}!`);
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

### Exemplo 2: RegisterScreen

```typescript
import {useRegister, useAuthUser, UserRole} from '@domain/Auth';

const {register, isLoading} = useRegister();
const {updateUser} = useAuthUser();

async function handleRegister() {
  const user = await register({
    name,
    phone: unformatPhone(phone),
    password,
    role: UserRole.PASSENGER,
  });

  updateUser(user);
  toast.showSuccess('Conta criada com sucesso!');
}
```

### Exemplo 3: ForgotPasswordScreen

```typescript
import {useForgotPassword} from '@domain/Auth';

const {forgotPassword, isLoading} = useForgotPassword();

async function handleSendCode() {
  await forgotPassword(unformatPhone(phone));
  toast.showSuccess('Código enviado para seu celular!');
}
```

## 📦 Exports Centralizados

```typescript
// Importa tudo de Auth de uma vez:
import {
  useLogin,
  useRegister,
  useForgotPassword,
  useResetPassword,
  useLogout,
  useAuthUser,
  User,
  UserRole,
} from '@domain/Auth';
```

## ✅ Vantagens da Estrutura Modular

### 1. **Máxima Coesão**
- Tudo relacionado a "Login" está em `Auth/Login/`
- Fácil encontrar e manter

### 2. **Separação Clara**
- **Types**: Contratos
- **API**: HTTP puro
- **Adapter**: Transformação
- **UseCase**: Orquestração

### 3. **Reutilização**
- Adapter pode ser usado em múltiplos lugares
- API pode ser chamada fora de componentes
- UseCase encapsula toda lógica

### 4. **Testabilidade**
```typescript
describe('loginAdapter', () => {
  it('should adapt response to User', () => {
    const response = mockLoginResponse;
    const user = loginAdapter.toUser(response);
    expect(user.role).toBe(UserRole.PASSENGER);
  });
});
```

### 5. **Escalabilidade**
Adicionar nova funcionalidade = criar nova pasta:
```
Auth/
├── TwoFactor/
│   ├── twoFactorTypes.ts
│   ├── twoFactorAPI.ts
│   ├── twoFactorAdapter.ts
│   ├── useTwoFactor.ts
│   └── index.ts
```

## 🎯 Convenções

### Nomenclatura de Arquivos
- **Types**: `<feature>Types.ts` (ex: `loginTypes.ts`)
- **API**: `<feature>API.ts` (ex: `loginAPI.ts`)
- **Adapter**: `<feature>Adapter.ts` (ex: `loginAdapter.ts`)
- **UseCase**: `use<Feature>.ts` (ex: `useLogin.ts`)

### Nomenclatura de Pastas
- PascalCase para funcionalidades: `Login/`, `Register/`, `ForgotPassword/`
- Cada pasta = 1 funcionalidade específica

## 🔄 Fluxo de Dados Completo

```
Component
    ↓
useCase (Hook)
    ↓
API (HTTP Call)
    ↓
Backend
    ↓
Response
    ↓
Adapter (Transform)
    ↓
Storage (Persist)
    ↓
Component (Updated State)
```

## 📝 Checklist para Nova Funcionalidade

Ao adicionar uma nova funcionalidade (ex: `ChangePassword`):

1. ✅ Criar pasta `Auth/ChangePassword/`
2. ✅ Criar `changePasswordTypes.ts` (interfaces)
3. ✅ Criar `changePasswordAPI.ts` (chamada HTTP)
4. ✅ Criar `changePasswordAdapter.ts` (se necessário)
5. ✅ Criar `useChangePassword.ts` (hook)
6. ✅ Criar `index.ts` (exports)
7. ✅ Exportar no `Auth/index.ts`

## 🎨 Exemplo Completo de Adapter

```typescript
// Login/loginAdapter.ts
import {LoginResponse} from './loginTypes';
import {User, UserRole} from '../User/userTypes';

export const loginAdapter = {
  /**
   * Adapta resposta da API para User da aplicação
   */
  toUser(response: LoginResponse): User {
    return {
      id: response.user.id,
      name: response.user.name,
      phone: response.user.phone,
      email: response.user.email,
      role: response.user.role as UserRole,
      cpf: response.user.cpf,
      isVerified: response.user.isVerified,
      createdAt: response.user.createdAt,
      updatedAt: response.user.updatedAt,
    };
  },

  /**
   * Extrai tokens da resposta
   */
  toTokens(response: LoginResponse) {
    return {
      token: response.token,
      refreshToken: response.refreshToken,
    };
  },

  /**
   * Valida se resposta é válida
   */
  isValid(response: LoginResponse): boolean {
    return !!(
      response.user?.id &&
      response.token &&
      response.refreshToken
    );
  },
};
```

---

**Arquitetura Modular DDD Implementada! 🎉**

Ultra-organizada, escalável e profissional.
Cada funcionalidade é um módulo independente e testável.
