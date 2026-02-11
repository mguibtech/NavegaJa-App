# 🍞 Sistema de Toast - NavegaJá

Sistema completo de notificações Toast com animações suaves usando Reanimated.

## 📦 Arquivos Criados

```
src/
├── store/
│   └── toast.store.ts           # Zustand store
├── components/
│   └── Toast/
│       ├── Toast.tsx             # Componente visual
│       └── ToastContainer.tsx    # Container de toasts
├── services/
│   └── toastService.ts          # Service singleton
└── hooks/
    └── useToast.ts              # Hook customizado
```

## 🎨 Tipos de Toast

- ✅ **Success** - Verde com ícone de check
- ❌ **Error** - Vermelho com ícone de erro
- ⚠️ **Warning** - Amarelo com ícone de aviso
- ℹ️ **Info** - Azul com ícone de informação

## 🚀 Como Usar

### Opção 1: Hook `useToast` (Recomendado)

```tsx
import {useToast} from '@hooks';

function MyScreen() {
  const toast = useToast();

  function handleSave() {
    // Success
    toast.showSuccess('Viagem salva com sucesso!');

    // Error
    toast.showError('Erro ao salvar viagem');

    // Warning
    toast.showWarning('Atenção: O barco está lotando');

    // Info
    toast.showInfo('Nova atualização disponível');
  }

  return <Button title="Salvar" onPress={handleSave} />;
}
```

### Opção 2: ToastService (Fora de componentes)

```tsx
import {ToastService} from '@services';

// Em qualquer lugar do código
ToastService.success('Login realizado!');
ToastService.error('Senha incorreta');
ToastService.warning('Sessão expirando em 5min');
ToastService.info('Novo recurso disponível');
```

## ⚙️ Opções Avançadas

### Duração Customizada

```tsx
toast.showSuccess('Reserva confirmada!', {
  duration: 5000, // 5 segundos (padrão: 3000)
});
```

### Toast com Ação

```tsx
toast.showError('Falha no envio', {
  action: {
    label: 'Tentar novamente',
    onPress: () => {
      console.log('Retrying...');
    },
  },
});
```

### Toast Persistente (Sem auto-hide)

```tsx
toast.showInfo('Processando...', {
  duration: 0, // Não fecha automaticamente
});

// Fechar manualmente depois
toast.hideAll();
```

## 🎯 Exemplo no LoginScreen

```tsx
import {useToast} from '@hooks';

async function handleLogin() {
  try {
    await login({phone, password});
    toast.showSuccess('Bem-vindo ao NavegaJá!');
  } catch (error) {
    toast.showError('Telefone ou senha incorretos');
  }
}
```

---

**Pronto para usar! 🎉** O ToastContainer já está no App.tsx.
