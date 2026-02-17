# 🛡️ Funcionalidades de Segurança no Mapa

Sistema completo de segurança implementado no mapa de rastreamento do NavegaJá.

## 📋 Visão Geral

O TrackingScreen agora possui um sistema robusto de segurança com:

1. **Alertas SOS em Tempo Real** - Visualização de emergências ativas próximas
2. **Zonas de Perigo** - Marcação de áreas perigosas conhecidas
3. **Botão SOS Rápido** - Acionar emergência com um toque
4. **Overlay de Segurança** - Nível de segurança da região atual
5. **Filtros de Visualização** - Controle sobre o que exibir no mapa

---

## 🚨 1. Alertas SOS no Mapa

### SosMarker Component

**Localização:** `src/components/SosMarker/SosMarker.tsx`

Marcador customizado que exibe alertas SOS ativos de outros usuários.

#### Características:

- **Ícone dinâmico** baseado no tipo de emergência:
  - 🏥 Médica (`medical`)
  - 🔥 Incêndio (`fire`)
  - 🌊 Vazamento/Naufrágio (`sinking`)
  - 🔧 Mecânica (`mechanical`)
  - ⛈️ Clima (`weather`)
  - ⚠️ Acidente (`accident`)
  - ❗ Geral (`general`)

- **Efeito visual pulsante** (anel de alerta)
- **Badge de prioridade** para alertas críticos
- **Popup informativo** (Callout) com:
  - Nome do usuário
  - Tipo de emergência
  - Descrição da situação
  - Informações da viagem (origem, destino, barco)
  - Número de contato (se disponível)
  - Botão para ligar diretamente

#### Uso:

```typescript
import {SosMarker} from '@components';
import {SosAlert} from '@domain';

const alert: SosAlert = {
  id: 'sos-001',
  type: SosType.MEDICAL,
  status: SosStatus.ACTIVE,
  location: {latitude: -3.05, longitude: -59.95},
  user: {name: 'Maria Santos', phone: '(92) 99888-7766'},
  description: 'Passageiro com dores no peito',
  // ...
};

<SosMarker
  alert={alert}
  onCalloutPress={() => handleSosPress(alert)}
/>
```

#### Cores por tipo:

| Tipo | Cor | Prioridade |
|------|-----|------------|
| Medical | Vermelho (#DC2626) | Critical |
| Fire | Laranja (#EA580C) | Critical |
| Sinking | Vermelho (#DC2626) | Critical |
| Accident | Vermelho (#DC2626) | Critical |
| Weather | Roxo (#7C3AED) | High |
| Mechanical | Amarelo (#D97706) | Medium |
| General | Vermelho (#DC2626) | High |

---

## ⚠️ 2. Zonas de Perigo

### DangerZone Component

**Localização:** `src/components/DangerZone/DangerZone.tsx`

Marcação visual de áreas perigosas no mapa usando polígonos ou círculos.

#### Tipos de Zona:

1. **Circle** - Área circular (raio em metros)
2. **Polygon** - Área irregular (lista de coordenadas)

#### Níveis de Perigo:

| Nível | Cor de Preenchimento | Cor da Borda | Opacidade |
|-------|---------------------|--------------|-----------|
| `low` | Amarelo âmbar | #F59E0B | 20% |
| `medium` | Laranja | #EA580C | 25% |
| `high` | Vermelho | #DC2626 | 30% |
| `critical` | Vermelho escuro | #991B1B | 40% |

#### Uso:

```typescript
import {DangerZone, DangerZoneData} from '@components';

// Zona circular
const zone: DangerZoneData = {
  id: 'zone-001',
  type: 'circle',
  name: 'Corredeiras do Ariaú',
  description: 'Área com correnteza forte',
  level: 'high',
  center: {latitude: -3.05, longitude: -60.1},
  radius: 2000, // 2km
};

// Zona poligonal
const zone2: DangerZoneData = {
  id: 'zone-002',
  type: 'polygon',
  name: 'Zona de Pirataria',
  description: 'Relatos de assaltos',
  level: 'critical',
  coordinates: [
    {latitude: -2.85, longitude: -59.4},
    {latitude: -2.82, longitude: -59.35},
    {latitude: -2.88, longitude: -59.32},
    {latitude: -2.91, longitude: -59.38},
  ],
};

<DangerZone zone={zone} onPress={handleZonePress} />
```

#### Casos de Uso:

- **Corredeiras e pedras submersas** (high)
- **Zonas de pirataria/assaltos** (critical)
- **Bancos de areia móveis** (medium)
- **Áreas de tempestades frequentes** (high)
- **Zonas de neblina densa** (medium)
- **Tráfego intenso de embarcações** (low)

---

## 🛡️ 3. Overlay de Segurança

### SafetyOverlay Component

**Localização:** `src/components/SafetyOverlay/SafetyOverlay.tsx`

Card flutuante que exibe o nível de segurança da região atual.

#### Características:

- **Nível de segurança** (SAFE, MODERATE, CAUTION, DANGER, CRITICAL)
- **Score numérico** (0-100)
- **Contador de alertas próximos** (raio de 50km)
- **Ícone e cores dinâmicas** baseadas no nível
- **Pressionável** para ver detalhes

#### Níveis de Segurança:

| Nível | Ícone | Cor | Descrição |
|-------|-------|-----|-----------|
| SAFE | shield-check | Verde | Condições seguras |
| MODERATE | shield | Azul | Atenção básica necessária |
| CAUTION | warning | Amarelo | Cuidado recomendado |
| DANGER | error | Laranja | Perigo presente |
| CRITICAL | dangerous | Vermelho | Risco extremo |

#### Uso:

```typescript
import {SafetyOverlay} from '@components';
import {SafetyLevel} from '@domain';

<SafetyOverlay
  level={SafetyLevel.MODERATE}
  score={72}
  nearbyAlerts={3}
  onPress={handleDetailsPress}
/>
```

---

## 🆘 4. Botão SOS Flutuante

### EmergencyButton Component

**Localização:** `src/components/EmergencyButton/EmergencyButton.tsx`

Botão circular flutuante para acionar SOS rapidamente.

#### Características:

- **Sempre visível** no canto inferior direito
- **Muda de cor** quando há alerta ativo
  - Vermelho (#DC2626): Sem alerta ativo
  - Laranja (#F59E0B): Alerta já acionado
- **Ícone dinâmico**:
  - `sos`: Modo padrão
  - `notification-important`: Alerta ativo
- **Shadow effect** para destaque
- **z-index alto** (999) para ficar sempre visível

#### Integração no TrackingScreen:

```typescript
import {EmergencyButton} from '@components';

<EmergencyButton
  onPress={() => navigation.navigate('SosAlert', {tripId})}
  hasActiveAlert={false}
/>
```

---

## 🎛️ 5. Filtros de Visualização

Botões flutuantes no canto superior direito para controlar o que é exibido no mapa.

### Controles:

1. **Toggle SOS Alerts** 🆘
   - Mostra/oculta marcadores de alertas SOS
   - Vermelho quando ativo, cinza quando inativo

2. **Toggle Danger Zones** ⚠️
   - Mostra/oculta zonas de perigo
   - Amarelo quando ativo, cinza quando inativo

#### Estados:

```typescript
const [showSosAlerts, setShowSosAlerts] = useState(true);
const [showDangerZones, setShowDangerZones] = useState(true);
```

---

## 📊 Dados Mock (Para Testes)

### MOCK_SOS_ALERTS

Simulação de 3 alertas ativos:

1. **Medical** (-3.05, -59.95) - "Passageiro com dores no peito" - 15 min atrás
2. **Mechanical** (-2.9, -59.5) - "Motor com falhas" - 45 min atrás
3. **Weather** (-2.75, -58.8) - "Tempestade forte" - 5 min atrás

### MOCK_DANGER_ZONES

Simulação de 3 zonas perigosas:

1. **Corredeiras do Ariaú** (high) - Círculo 2km
2. **Zona de Pirataria** (critical) - Polígono
3. **Banco de Areia Móvel** (medium) - Círculo 1.5km

---

## 🔧 Funcionalidades Auxiliares

### calculateNearbyAlerts()

Calcula quantos alertas SOS estão próximos da posição atual (raio de 50km).

```typescript
const nearbyCount = calculateNearbyAlerts();
// Retorna: número de alertas dentro do raio
```

### calculateDistance()

Fórmula de Haversine simplificada para calcular distância entre duas coordenadas.

```typescript
const distanceKm = calculateDistance(
  lat1, lon1, // Ponto 1
  lat2, lon2  // Ponto 2
);
```

---

## 🎨 Experiência Visual

### Elementos de UI:

1. **SafetyOverlay** - Topo do mapa, sempre visível
2. **SosMarkers** - Pulsam para chamar atenção
3. **DangerZones** - Transparentes para não obstruir
4. **EmergencyButton** - Canto inferior direito, sempre acessível
5. **Filter Buttons** - Canto superior direito, discretos

### Hierarquia de z-index:

```
1. EmergencyButton (999)
2. Filter Buttons (997)
3. SafetyOverlay (995)
4. Map Elements (padrão)
```

---

## 🚀 Próximos Passos (Futuro)

### Backend Integration:

- [ ] Conectar com API de alertas SOS em tempo real
- [ ] WebSocket para updates instantâneos
- [ ] Sincronização de zonas de perigo do servidor
- [ ] Histórico de alertas resolvidos

### Melhorias de UX:

- [ ] Animação de pulsação nos marcadores SOS
- [ ] Notificação push quando entrar em zona perigosa
- [ ] Rota alternativa evitando zonas críticas
- [ ] Filtro por tipo de alerta (medical, fire, etc.)
- [ ] Clustered markers para muitos alertas próximos

### Analytics:

- [ ] Estatísticas de segurança da rota
- [ ] Heatmap de incidentes históricos
- [ ] Score de segurança em tempo real
- [ ] Alertas preditivos baseados em padrões

---

## 📱 Screenshots Conceituais

```
┌─────────────────────────────────┐
│ ┌─ Safety Overlay ────────────┐ │
│ │ 🛡️ Moderado | Score: 72/100 │ │
│ │ ⚠️ 3 alertas próximos        │ │
│ └─────────────────────────────┘ │
│                                 │
│         🆘 [SOS Alert]          │ ← Filter
│         ⚠️ [Danger Zone]        │ ← Buttons
│                                 │
│     🗺️ [Mapa com alertas]      │
│                                 │
│                          [🆘]   │ ← Emergency
└─────────────────────────────────┘    Button
```

---

## 🔐 Considerações de Segurança

1. **Privacidade**:
   - Só mostre alertas ativos
   - Não exponha localização exata de usuários sem consentimento
   - Permita desabilitar compartilhamento de localização

2. **Validação**:
   - Verificar autenticidade dos alertas SOS
   - Sistema de report para alertas falsos
   - Rate limiting para evitar spam

3. **Performance**:
   - Limitar número de marcadores renderizados
   - Usar clustering para muitos alertas
   - Cache de zonas de perigo estáticas

---

## 📚 Documentação Relacionada

- [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) - Setup do Google Maps
- Sistema SOS: `src/domain/App/Safety/`
- Hooks: `src/domain/App/Safety/useCases/useSosAlert.ts`
- Types: `src/domain/App/Safety/safetyTypes.ts`

---

**Implementado com foco em salvar vidas! 🛟**
