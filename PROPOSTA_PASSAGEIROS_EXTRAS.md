# Proposta: Modal por Passageiro Extra — BookingScreen

## Situação atual vs. proposta

**Problemas atuais:**
- Passageiros extras adultos → mensagem "podem ser adicionados após a confirmação" (UX pobre)
- Crianças → só coletam `idade` via +/−, sem nome
- A seção de crianças fica inline e fica confusa quando há vários

---

## Layout proposto (Main Screen)

```
┌─────────────────────────────────────┐
│ Adultos (máx. 5)    [−]  3  [+]     │
│ Crianças            ──────── [ON]   │
│                                     │
│ Passageiro principal                │
│ ┌──────────────────────────────┐    │
│ │ 👤 João Silva · 123.456.789-00│   │  ← inline (como hoje)
│ └──────────────────────────────┘    │
│                                     │
│ Passageiro 2                        │
│ ┌──────────────────────────────┐    │
│ │ + Adicionar dados        [>] │    │  ← toca → modal
│ └──────────────────────────────┘    │
│                                     │
│ Criança 1                           │
│ ┌──────────────────────────────┐    │
│ │ 👶 Ana · Bebê (0 anos)  ✓ [>]│   │  ← preenchido, toca p/ editar
│ └──────────────────────────────┘    │
│                                     │
│ [+ Adicionar criança]               │
└─────────────────────────────────────┘
```

---

## Modal — Adulto extra

```
┌─────────────────────────────────┐
│  Passageiro 2                   │
│                                 │
│  Nome completo *                │
│  [_________________________]    │
│                                 │
│  CPF *                          │
│  [_________________________]    │
│                                 │
│          [Confirmar]            │
└─────────────────────────────────┘
```

---

## Modal — Criança

```
┌─────────────────────────────────┐
│  Criança 1                      │
│                                 │
│  Nome (opcional)                │
│  [_________________________]    │
│                                 │
│  Idade *                        │
│         [−]  Bebê  [+]          │
│                                 │
│  ℹ️  Até 9 anos = gratuito       │
│                                 │
│  [Remover]       [Confirmar]    │
└─────────────────────────────────┘
```

---

## Impacto no backend

| Campo | Situação atual | Com a proposta |
|---|---|---|
| Crianças | `children: number[]` (só idades) | Sem mudança |
| Adultos extras | Não enviado | `passengers: [{name, cpf}]` se backend suportar |
| Passageiro principal | Nome + CPF inline | Sem mudança |

---

## Tipos novos (TypeScript)

```typescript
type ExtraAdult = {
  name: string;
  cpf: string;
};

type Child = {
  name?: string; // opcional
  age: number;   // 0–17
};
```

---

## Pergunta pendente

O backend aceita dados dos passageiros adultos extras (nome/CPF) no momento da reserva?
- **Sim** → implementar envio completo
- **Não** → implementar só para crianças (nome + idade via modal), adultos extras ficam como cards visuais sem envio à API
