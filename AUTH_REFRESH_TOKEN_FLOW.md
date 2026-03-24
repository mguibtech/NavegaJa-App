# Fluxo de Refresh Token no app

Este documento descreve o comportamento real da implementacao atual para uma outra IA conseguir entender e modificar o fluxo sem fazer suposicoes erradas.

## Fontes principais

- `src/api/apiClient.ts`
- `src/services/authStorage.ts`
- `src/store/auth.store.ts`
- `src/routes/Router.tsx`
- `src/domain/Auth/Login/loginAPI.ts`
- `src/domain/Auth/Register/registerAPI.ts`
- `src/domain/Auth/RefreshToken/refreshTokenAPI.ts`

## Resumo executivo

- O app usa `accessToken` + `refreshToken`.
- Os dois tokens sao guardados com `react-native-keychain`.
- O objeto `user` e guardado separadamente no `AsyncStorage`.
- Toda request HTTP passa por um interceptor Axios que tenta adicionar `Authorization: Bearer <token>`.
- Se uma request protegida voltar `401`, o cliente tenta renovar o token em `POST /auth/refresh`.
- Enquanto um refresh esta em andamento, outras requests que tambem falham com `401` nao disparam refresh novo: elas entram em uma fila de espera.
- Quando o refresh termina, essa fila e liberada:
  - sucesso: cada request tenta de novo com o novo token
  - erro: todas falham e a sessao local e limpa
- Existe um segundo refresh explicito em `Router.tsx` para notificacoes push que exigem token novo (`requiresTokenRefresh === 'true'`).

## Onde e como os tokens sao armazenados

### Access token

Arquivo: `src/services/authStorage.ts`

- Chave Keychain service: `navegaja.token`
- Metodo de escrita: `authStorage.saveToken(token)`
- Metodo de leitura: `authStorage.getToken()`
- Metodo de remocao: `authStorage.removeToken()`

Implementacao relevante:

- `Keychain.setGenericPassword('token', token, { service: 'navegaja.token' })`
- `Keychain.getGenericPassword({ service: 'navegaja.token' })`

### Refresh token

Arquivo: `src/services/authStorage.ts`

- Chave Keychain service: `navegaja.refreshToken`
- Metodo de escrita: `authStorage.saveRefreshToken(refreshToken)`
- Metodo de leitura: `authStorage.getRefreshToken()`
- Metodo de remocao: `authStorage.removeRefreshToken()`

Implementacao relevante:

- `Keychain.setGenericPassword('refreshToken', refreshToken, { service: 'navegaja.refreshToken' })`
- `Keychain.getGenericPassword({ service: 'navegaja.refreshToken' })`

### Dados do usuario

Arquivo: `src/services/authStorage.ts`

- Chave AsyncStorage: `@navegaja:user`
- Metodo de escrita: `authStorage.saveUser(user)`
- Metodo de leitura: `authStorage.getUser()`

Importante:

- Token e refresh token ficam no Keychain.
- Apenas dados nao sensiveis do usuario ficam no AsyncStorage.
- `authStorage.clear()` apaga os 3 itens ao mesmo tempo.

## Como os tokens entram no storage

### Login

Arquivos:

- `src/domain/Auth/Login/loginAPI.ts`
- `src/domain/Auth/Login/loginAdapter.ts`
- `src/store/auth.store.ts`

Fluxo:

1. `loginAPI.execute()` chama `POST /auth/login`.
2. A resposta contem `accessToken`, `refreshToken` e `user`.
3. `loginAdapter.toTokens()` converte a resposta para:
   - `token: response.accessToken`
   - `refreshToken: response.refreshToken`
4. `useAuthStore.login()` salva:
   - `authStorage.saveToken(token)`
   - `authStorage.saveRefreshToken(refreshToken)`
   - `authStorage.saveUser(user)`

### Registro

Arquivos:

- `src/domain/Auth/Register/registerAPI.ts`
- `src/domain/Auth/Register/registerAdapter.ts`
- `src/store/auth.store.ts`

Fluxo identico ao login:

1. `registerAPI.execute()` chama `POST /auth/register`.
2. A resposta contem `accessToken`, `refreshToken` e `user`.
3. `useAuthStore.register()` salva token, refresh token e user.

## Como cada request recebe o token

Arquivo: `src/api/apiClient.ts`

No interceptor de request:

1. Antes de cada chamada HTTP, o app executa `authStorage.getToken()`.
2. Se existir token, injeta `config.headers.Authorization = Bearer <token>`.
3. Isso significa que o cliente nao depende so de `client.defaults.headers.common.Authorization`.

Consequencia importante:

- Mesmo apos reiniciar o app, qualquer request futura ainda consegue buscar o token direto do Keychain.
- O header default do Axios e atualizado no refresh bem sucedido, mas o mecanismo principal continua sendo a leitura do storage a cada request.

## Como o refresh automatico funciona

Arquivo principal: `src/api/apiClient.ts`

### Regras para tentar refresh

O refresh automatico so acontece quando:

- a resposta volta `401`
- a request original ainda nao foi marcada com `_retry`
- a URL nao e:
  - `/auth/refresh`
  - `/auth/login`
  - `/auth/register`

Isso evita loop infinito em rotas de autenticacao.

### Fluxo detalhado

Quando uma request retorna `401`:

1. O interceptor pega `originalRequest = error.config`.
2. Se a mensagem do backend for `Conta bloqueada ou nao encontrada`, ele:
   - limpa storage local
   - mostra toast de conta suspensa
   - chama `onUnauthorized()`
   - nao tenta refresh
3. Se ja existe refresh em andamento (`isRefreshing === true`):
   - a request entra na fila de espera
   - quando o refresh atual terminar, ela tenta novamente com o novo token
4. Se nao existe refresh em andamento:
   - marca `originalRequest._retry = true`
   - seta `isRefreshing = true`
   - le `refreshToken` do Keychain
   - chama `POST /auth/refresh` com body `{ refreshToken }`
5. Se o refresh der certo:
   - le `accessToken` e `refreshToken` novos da resposta
   - salva os dois no Keychain
   - chama `setAuthToken(accessToken)` para atualizar default header do Axios
   - libera a fila com `processQueue(null, accessToken)`
   - atualiza o header da request original
   - repete a request original
6. Se o refresh falhar:
   - rejeita toda a fila com `processQueue(refreshError, null)`
   - limpa storage local
   - chama `onUnauthorized()` se estiver registrado
   - propaga erro
7. No `finally`, seta `isRefreshing = false`

## Como a fila de requests funciona de verdade

Arquivo: `src/api/apiClient.ts`

### Estrutura real da fila

A fila nao guarda diretamente o objeto completo da request.

Ela guarda um array chamado `failedQueue` com itens no formato:

```ts
{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}
```

### O que isso significa na pratica

Quando uma request bate `401` enquanto `isRefreshing === true`, o codigo faz:

```ts
return new Promise((resolve, reject) => {
  this.failedQueue.push({ resolve, reject });
})
  .then(token => {
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return this.client(originalRequest);
  });
```

Interpretacao correta:

- A fila guarda apenas callbacks `resolve/reject`.
- O `originalRequest` nao fica salvo dentro do array.
- O retry da request antiga depende da closure criada naquele `Promise.then(...)`.
- Quando `processQueue()` roda com sucesso, ele chama `resolve(token)` para cada item.
- Esse `token` cai no `.then(token => ...)` de cada request pendente.
- A propria request pendente reutiliza sua `originalRequest` capturada em closure e se executa de novo.

### Como a fila e liberada

Metodo:

```ts
processQueue(error, token)
```

Comportamento:

- se `error` existir: chama `reject(error)` para todos
- senao: chama `resolve(token)` para todos
- depois limpa `failedQueue = []`

### Resultado operacional

Se 5 requests tomarem `401` ao mesmo tempo:

1. A primeira inicia o refresh.
2. As outras 4 nao chamam `/auth/refresh`.
3. As outras 4 ficam esperando o `resolve(token)` da fila.
4. Quando o refresh termina:
   - a primeira repete a request dela
   - as outras 4 repetem cada uma sua request original com o novo token

## Refresh explicito fora do interceptor

Arquivo: `src/routes/Router.tsx`

Existe uma funcao auxiliar:

```ts
refreshTokensIfNeeded(data)
```

Ela so faz refresh quando:

```ts
data.requiresTokenRefresh === 'true'
```

Fluxo:

1. Le o refresh token salvo com `authStorage.getRefreshToken()`.
2. Se nao houver refresh token, sai sem erro.
3. Chama `apiClient.post('/auth/refresh', { refreshToken: storedRefreshToken })`.
4. Salva `response.accessToken` e `response.refreshToken`.
5. Se falhar, ignora silenciosamente.

### Para que isso existe

Esse caminho e usado em eventos de notificacao push, especialmente quando o backend sinaliza que o JWT precisa ser renovado antes de navegar ou atualizar perfil/capabilities.

Casos onde aparece:

- abertura de notificacao em background
- abertura inicial do app via notificacao
- eventos como `boat_manager_assigned`
- eventos como `boat_manager_removed`

## Como o app lida com sessao invalida

### Callback global de nao autorizado

Arquivo: `src/routes/Router.tsx`

Na inicializacao, o app registra:

```ts
apiClient.setUnauthorizedHandler(() => {
  showError('Sua sessao expirou. Faca login novamente.');
  logout(true);
});
```

Efeito:

- quando o refresh falha de forma definitiva, o `ApiClient` chama esse callback
- o store executa `logout(true)`
- `true` significa: nao tentar `unregisterPushToken()`, para evitar mais uma chamada protegida gerando outro `401`

### Restauracao de sessao na abertura do app

Arquivo: `src/store/auth.store.ts`

`loadStoredUser()` faz:

1. le o `accessToken`
2. se existir, chama `userAPI.getMe()` (`GET /auth/me`)
3. se funcionar:
   - `isLoggedIn = true`
   - `user = me`
4. se falhar com `401`:
   - limpa storage
   - desloga localmente
5. se falhar por rede/servidor:
   - nao desloga automaticamente
   - apenas encerra loading

## Contratos esperados pelo backend

### Login/Register response

O frontend espera resposta com:

```ts
{
  accessToken: string;
  refreshToken: string;
  user: { ... }
}
```

### Refresh request

O frontend envia:

```ts
{
  refreshToken: string;
}
```

### Refresh response

Hoje o codigo assume que o endpoint de refresh devolve pelo menos:

```ts
{
  accessToken: string;
  refreshToken: string;
}
```

Observacao:

- O tipo compartilhado `RefreshTokenResponse` reaproveita `AuthResponse`, que tambem inclui `user`.
- No fluxo automatico de refresh em `apiClient.ts`, o codigo usa apenas `accessToken` e `refreshToken`.
- No fluxo de notificacao em `Router.tsx`, tambem usa apenas os dois tokens.

## Pontos importantes para outra IA nao errar

1. O app tem dois fluxos de refresh:
   - automatico no interceptor Axios
   - explicito em `Router.tsx` para notificacoes com `requiresTokenRefresh`

2. A fila nao armazena requests completas.
   - Ela armazena `resolve/reject`.
   - O retry da request antiga acontece pela closure do `Promise.then`.

3. O token e lido do Keychain em toda request.
   - Entao nao assuma que o app depende apenas de header default do Axios.

4. As rotas `/auth/login`, `/auth/register` e `/auth/refresh` estao explicitamente fora da logica de auto-refresh.

5. Se o refresh falhar, o comportamento atual e agressivo:
   - limpa storage
   - aciona logout global
   - derruba todas as requests pendentes da fila

6. Existe um caso especial de conta bloqueada.
   - Nessa situacao o app nao tenta refresh.

7. `logout(true)` existe para evitar ciclo infinito de 401 durante limpeza do token push.

## Pseudocodigo consolidado

```text
request -> interceptor de request
  -> le accessToken do Keychain
  -> adiciona Authorization
  -> envia

se response == 401 e request elegivel para refresh:
  se conta bloqueada:
    limpar sessao
    logout global
    falhar

  se isRefreshing == true:
    criar Promise
    guardar resolve/reject em failedQueue
    quando receber token novo:
      repetir originalRequest

  senao:
    marcar _retry
    isRefreshing = true
    le refreshToken do Keychain
    POST /auth/refresh

    se sucesso:
      salvar novos tokens
      atualizar header default
      liberar fila com novo token
      repetir originalRequest

    se falha:
      rejeitar fila
      limpar sessao
      logout global

    finally:
      isRefreshing = false
```

## Arquivos que devem ser lidos antes de mexer nesse fluxo

- `src/api/apiClient.ts`
- `src/services/authStorage.ts`
- `src/store/auth.store.ts`
- `src/routes/Router.tsx`

Se a outra IA for alterar o comportamento, esses 4 arquivos sao a fonte minima de verdade.
