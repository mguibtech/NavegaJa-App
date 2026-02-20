# DiceBear Avatar — Implementação no NavegaJá APP

> Guia completo da integração de avatares animados com a API DiceBear no React Native.

---

## Visão Geral

O app NavegaJá utiliza a biblioteca [DiceBear](https://www.dicebear.com/) para gerar avatares animados/ilustrados personalizáveis. O usuário pode escolher entre **12 estilos visuais diferentes** e customizar cores, cabelo, acessórios e muito mais — tudo **offline**, sem nenhuma requisição de rede.

### Como funciona

```
Usuário escolhe estilo + customizações
         ↓
buildDiceBearUrl() → URL HTTP válida como identificador
         ↓
Salvo no backend: PATCH /users/profile { avatarUrl: "https://api.dicebear.com/..." }
         ↓
UserAvatar renderiza localmente via @dicebear/collection + react-native-svg
(NUNCA faz request HTTP para api.dicebear.com)
```

---

## Dependências

```json
"@dicebear/core": "^9.3.1",
"@dicebear/collection": "^9.3.1",
"react-native-svg": "^15.x"
```

### Instalação

```bash
yarn add @dicebear/core @dicebear/collection
# react-native-svg já deve estar instalado (necessário para SvgXml)
```

---

## Arquivos da Implementação

| Arquivo | Responsabilidade |
|---|---|
| `src/components/UserAvatar/UserAvatar.tsx` | Renderização do avatar (todos os casos) |
| `src/components/AvatarEditor/AvatarEditorModal.tsx` | Modal de customização completo |
| `src/screens/app/EditProfileScreen.tsx` | Integração na tela de perfil |

---

## UserAvatar Component

**Localização:** `src/components/UserAvatar/UserAvatar.tsx`

### Props

```typescript
interface UserAvatarProps {
  userId?: string | null;     // usado como seed para fallback DiceBear
  avatarUrl?: string | null;  // URL do avatar (dicebear ou foto real)
  name?: string | null;       // usado como seed alternativo
  size?: AvatarSize;          // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}
```

### Tamanhos disponíveis

| Size | Pixels |
|---|---|
| `xs` | 32×32 |
| `sm` | 40×40 |
| `md` | 56×56 |
| `lg` | 80×80 |
| `xl` | 100×100 |

### Prioridade de renderização

```
1. avatarUrl contém 'api.dicebear.com' ou começa com 'dicebear:'
   → parseDiceBearUrl() extrai style + seed + urlParams
   → generateDiceBearSvg() cria SVG localmente
   → <SvgXml xml={svg} /> — zero requisições de rede

2. avatarUrl.startsWith('http') (foto real)
   → <Image source={{uri: avatarUrl}} onError={...} />

3. Fallback: generateDiceBearSvg('avataaars', userId ?? name ?? 'default')
   → Avatar gerado localmente, sem rede, sempre visível
```

### Uso básico

```tsx
import {UserAvatar} from '@components';

// Avatar com URL DiceBear (renderiza localmente)
<UserAvatar
  avatarUrl="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=ffdbb4"
  size="md"
/>

// Avatar com foto real
<UserAvatar
  avatarUrl="https://meubackend.com/uploads/foto.jpg"
  userId="user-123"
  size="lg"
/>

// Fallback automático (apenas userId)
<UserAvatar userId="user-123" name="João Silva" size="sm" />
```

### Funções utilitárias exportadas

```typescript
// Gera SVG localmente (sem rede)
generateDiceBearSvg(style: DiceBearStyle, seed: string, urlParams?: Record<string, string>): string

// Constrói URL HTTP canônica
buildDiceBearUrl(style: DiceBearStyle, seed: string, urlParams?: Record<string, string>): string
// → "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=ffdbb4"

// Faz parse de URL DiceBear (nova ou legado)
parseDiceBearUrl(url: string): { style, seed, urlParams } | null
```

---

## Estilos Disponíveis (12)

| Style ID | Nome Visual | Características |
|---|---|---|
| `avataaars` | Cartoon | Humano estilizado, muito personalizável |
| `lorelei` | Lorelei | Minimalista feminino, linhas suaves |
| `bottts` | Bottts | Robôs coloridos |
| `pixel-art` | Pixel Art | Estilo retrô 8-bit |
| `micah` | Micah | Geométrico colorido |
| `fun-emoji` | Fun Emoji | Emoji expressivo |
| `initials` | Iniciais | Letras do nome em círculo colorido |
| `adventurer` | Adventurer | Aventureiro estilizado |
| `open-peeps` | Open Peeps | Personagem ilustrado |
| `personas` | Personas | Profissional/corporativo |
| `notionists` | Notionists | Estilo Notion minimalista |
| `thumbs` | Thumbs | Personagem adorável |

---

## Opções de Customização por Estilo

### avataaars (Cartoon)
| Opção | Tipo | Exemplos de valores |
|---|---|---|
| `skinColor` | cor | `ffdbb4`, `ae5d29`, `edb98a`, `fd9841`, `f8d25c`, `d08b5b`, `614335` |
| `hairColor` | cor | `auburn`, `black`, `blonde`, `brown`, `gray`, `platinum`, `red`, `silverGray` |
| `top` | thumb | `shortHair`, `longHair`, `hijab`, `turban`, `winterHat`, `hat`, `eyepatch`, `noHair` |
| `accessories` | thumb+toggleable | `kurt`, `prescription01`, `round`, `sunglasses`, `wayfarers` ou `none` |
| `facialHair` | thumb+toggleable | `beardLight`, `beardMedium`, `moustacheFancy`, `moustacheMagnum` ou `none` |

### micah
| Opção | Tipo | Exemplos |
|---|---|---|
| `baseColor` | cor | `9e5622`, `d78774`, `f9c9b6`, `ac6651`, `ecad80` |
| `hairColor` | cor | 9 opções de cor |
| `hair` | thumb | 8 estilos |
| `eyes` | thumb | 5 estilos |
| `mouth` | thumb | 8 estilos |
| `glasses` | thumb+toggleable | 2 estilos ou `none` |
| `facialHair` | thumb+toggleable | 2 estilos ou `none` |
| `earrings` | thumb+toggleable | 2 estilos ou `none` |

### lorelei
| Opção | Tipo | Exemplos |
|---|---|---|
| `hair` | thumb | 13 curados de 48 disponíveis |
| `mouth` | thumb | 11 estilos |
| `eyebrows` | thumb | 6 estilos |
| `glasses` | thumb+toggleable | 5 estilos ou `none` |
| `beard` | thumb+toggleable | 2 estilos ou `none` |
| `earrings` | thumb+toggleable | 3 estilos ou `none` |

> Para a lista completa de todas as opções de todos os 12 estilos, consulte `AvatarEditorModal.tsx` → constante `STYLE_CONFIG`.

---

## AvatarEditorModal

**Localização:** `src/components/AvatarEditor/AvatarEditorModal.tsx`

### Props

```typescript
interface AvatarEditorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dicebearUrl: string) => void;
  initialUrl?: string | null;  // URL atual do avatar (para editar existente)
  userId?: string | null;      // usado como seed padrão
}
```

### Como abrir o modal

```tsx
import {AvatarEditorModal} from '@components';
// ou
import {AvatarEditorModal} from 'src/components/AvatarEditor';

const [showEditor, setShowEditor] = useState(false);
const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

// No JSX:
<AvatarEditorModal
  visible={showEditor}
  onClose={() => setShowEditor(false)}
  onConfirm={(url) => {
    setAvatarUrl(url);
    // url já é uma URL HTTP válida, pronta para salvar no backend
    userAPI.updateAvatar(url);
  }}
  initialUrl={avatarUrl}
  userId={user.id}
/>
```

### Fluxo interno do modal

```
1. Abre com estilo atual (parseDiceBearUrl do initialUrl) ou 'avataaars'
2. Grade 3 colunas com 12 estilos + preview SVG ao vivo
3. Ao trocar de estilo → STYLE_DEFAULTS aplicados (reseta toggleable keys para 'none')
4. Seções de customização renderizadas dinamicamente via STYLE_CONFIG[selectedStyle]
5. Preview do avatar atualiza em tempo real conforme customizações
6. Thumbnails por opção gerados via useMemo (lazy, apenas para o estilo atual)
7. "Confirmar" → buildDiceBearUrl(style, seed, options) → onConfirm(url)
```

---

## Formato da URL

```
https://api.dicebear.com/9.x/{style}/svg?seed={seed}&{key}={value}&...
```

### Exemplos

```
# avataaars simples
https://api.dicebear.com/9.x/avataaars/svg?seed=Felix

# avataaars com customizações
https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&skinColor=ffdbb4&hairColor=auburn&top=shortHairShortFlat&accessories=none&facialHair=none

# micah com cor de pele e óculos
https://api.dicebear.com/9.x/micah/svg?seed=Alice&baseColor=f9c9b6&glasses=round&facialHair=none

# initials com fundo azul e peso da fonte
https://api.dicebear.com/9.x/initials/svg?seed=JS&backgroundColor=0B5D8A&fontWeight=700
```

### Como a URL é interpretada pelo app

```typescript
// urlParamsToDiceBearOptions converte a querystring para opções do @dicebear/core:

// Opções toggleable (accessories, glasses, facialHair, beard, earrings, hat, texture, mask):
accessories=none        → { accessoriesProbability: 0 }
accessories=kurt        → { accessories: ['kurt'], accessoriesProbability: 100 }

// Opções array (tudo mais):
skinColor=ffdbb4        → { skinColor: ['ffdbb4'] }
top=shortHairShortFlat  → { top: ['shortHairShortFlat'] }

// Opções numéricas:
fontWeight=700          → { fontWeight: 700 }

// Opções string:
fontFamily=serif        → { fontFamily: 'serif' }
```

---

## Integração com Backend

### Salvar avatar

```typescript
// PATCH /users/profile
await userAPI.updateAvatar(dicebearUrl);
// body enviado: { avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=..." }

// O backend aceita porque é uma URL HTTP válida
// Qualquer string sem https:// seria rejeitada com 400 "URL do avatar inválida"
```

### Endpoint real

```
PATCH /users/profile
Body: { avatarUrl: string }  ← URL HTTP completa obrigatória
```

---

## Pontos de Atenção

### ❌ Formato legado (NÃO usar para salvar)

```
dicebear:avataaars:Felix   ← backend rejeita com 400
```

O app ainda **parseia** esse formato por compatibilidade retroativa, mas nunca o **gera** para salvar.

### ✅ Formato correto

```
https://api.dicebear.com/9.x/avataaars/svg?seed=Felix
```

### Renderização offline

O app **nunca faz requisição** para `api.dicebear.com`. A URL é apenas um identificador. A renderização usa `@dicebear/collection` localmente:

```typescript
import {createAvatar} from '@dicebear/core';
import {avataaars} from '@dicebear/collection';

const svg = createAvatar(avataaars, {
  seed: 'Felix',
  skinColor: ['ffdbb4'],
  accessoriesProbability: 0,  // accessories=none
}).toString();

// Renderiza com react-native-svg:
<SvgXml xml={svg} width={56} height={56} />
```

### Thumbnails e performance

Os thumbnails no modal são gerados via `useMemo([selectedStyle])` — apenas as opções do estilo atualmente selecionado são calculadas. Trocar de estilo regenera apenas os thumbnails do novo estilo.

---

## Exportações disponíveis

```typescript
// De @components (src/components/index.ts):
import {
  UserAvatar,
  UserAvatarProps,
  AvatarSize,
  DiceBearStyle,
  generateDiceBearSvg,
  buildDiceBearUrl,
  parseDiceBearUrl,
  buildDiceBearUrlFromParsed,
  AvatarEditorModal,
} from '@components';
```

---

## Exemplo completo de uso

```tsx
import React, {useState} from 'react';
import {Alert} from 'react-native';
import {UserAvatar, AvatarEditorModal, buildDiceBearUrl} from '@components';
import {userAPI} from '@domain';
import {useAuthStore} from 'src/store/auth.store';

export function MyProfileAvatar() {
  const {user, updateUser} = useAuthStore();
  const [showEditor, setShowEditor] = useState(false);

  const handleAvatarTap = () => {
    Alert.alert('Alterar avatar', undefined, [
      {text: 'Avatar Animado', onPress: () => setShowEditor(true)},
      {text: 'Cancelar', style: 'cancel'},
    ]);
  };

  const handleConfirm = async (dicebearUrl: string) => {
    try {
      await userAPI.updateAvatar(dicebearUrl);
      updateUser({avatarUrl: dicebearUrl});
      setShowEditor(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o avatar');
    }
  };

  return (
    <>
      <UserAvatar
        avatarUrl={user?.avatarUrl}
        userId={user?.id}
        name={user?.name}
        size="xl"
        onPress={handleAvatarTap}  // se o componente suportar onPress
      />

      <AvatarEditorModal
        visible={showEditor}
        onClose={() => setShowEditor(false)}
        onConfirm={handleConfirm}
        initialUrl={user?.avatarUrl}
        userId={user?.id}
      />
    </>
  );
}
```

---

## Referências

- [DiceBear Docs](https://www.dicebear.com/how-to-use/http-api/)
- [DiceBear Editor Online](https://editor.dicebear.com/) — para explorar opções visualmente
- [DiceBear Styles](https://www.dicebear.com/styles/) — catálogo de todos os estilos
- [@dicebear/core NPM](https://www.npmjs.com/package/@dicebear/core)
- [@dicebear/collection NPM](https://www.npmjs.com/package/@dicebear/collection)

---

*Implementado em: NavegaJá APP v5.8 — 2026-02-20*
