# 🗺️ Configuração do Google Maps

Este guia explica como configurar o Google Maps API no app NavegaJá.

## ✅ O que já está configurado

- ✅ Dependências instaladas (`react-native-maps`, `@react-native-community/geolocation`)
- ✅ AndroidManifest.xml configurado
- ✅ build.gradle configurado
- ✅ TrackingScreen usando MapView real
- ✅ Componente BoatMarker customizado criado

## 📝 Passos para ativar o Google Maps

### 1. Obter a API Key do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Library**
4. Procure e ative as seguintes APIs:
   - **Maps SDK for Android**
   - **Maps SDK for iOS** (se for usar iOS)
   - **Directions API** (opcional - para rotas otimizadas)
   - **Geocoding API** (opcional - para busca de endereços)
   - **Places API** (opcional - para busca de locais)

5. Vá em **APIs & Services** > **Credentials**
6. Clique em **Create Credentials** > **API Key**
7. Copie a API Key gerada

### 2. Configurar a API Key no Android

Abra o arquivo `android/gradle.properties` e substitua:

```properties
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

Por:

```properties
GOOGLE_MAPS_API_KEY=SUA_API_KEY_AQUI
```

### 3. (Opcional) Restringir a API Key

Para segurança, é recomendado restringir sua API Key:

1. No Google Cloud Console, vá em **Credentials**
2. Clique na sua API Key
3. Em **Application restrictions**, selecione **Android apps**
4. Adicione o package name: `com.navegajaapp`
5. Adicione a SHA-1 fingerprint do seu keystore de debug:

```bash
# No diretório do projeto
cd android
./gradlew signingReport

# Copie o SHA-1 fingerprint da variant 'debug'
```

### 4. Rebuild do App

Depois de adicionar a API Key, é necessário fazer rebuild:

```bash
# Limpar cache
cd android
./gradlew clean
cd ..

# Rebuild
yarn android
```

## 🧪 Testar se está funcionando

1. Abra o app
2. Faça login
3. Navegue para **Reservas** > Clique em uma reserva ativa
4. Clique em **Rastrear Viagem**
5. Você deve ver o mapa do Google com:
   - ✅ Marcador verde (origem - Manaus)
   - ✅ Marcador customizado do barco (posição atual)
   - ✅ Marcador vermelho (destino - Parintins)
   - ✅ Linha azul conectando os pontos

## 🔧 Troubleshooting

### Problema: Mapa aparece em branco

**Solução 1**: Verifique a API Key
- Confirme que copiou a API Key corretamente em `gradle.properties`
- Verifique se a **Maps SDK for Android** está ativada no Google Cloud Console

**Solução 2**: Rebuild completo
```bash
cd android
./gradlew clean
cd ..
yarn android
```

**Solução 3**: Verifique os logs
```bash
adb logcat | grep -i maps
```

### Problema: Erro "API key not found"

A API Key não foi passada corretamente. Verifique:
1. Arquivo `android/gradle.properties` tem a chave correta
2. Rebuild do app foi feito

### Problema: Mapa mostra "For development purposes only"

A API Key está sem billing account. Você precisa:
1. Adicionar um método de pagamento no Google Cloud
2. O Google oferece $200 de crédito gratuito por mês
3. Uso normal do app não deve gerar custos

## 💰 Custos do Google Maps

- **Crédito gratuito**: $200/mês
- **Maps SDK for Android**: $0.007 por load (14,000 loads gratuitos/mês)
- **Maps SDK for iOS**: $0.007 por load

Para o NavegaJá, considerando uso moderado, você ficará dentro do free tier.

## 📱 Recursos Implementados

### TrackingScreen com Google Maps

O TrackingScreen agora usa o MapView real com:

- **Mapa interativo**: Zoom, pan, rotate
- **Marcador customizado de barco**: Ícone azul com efeito de ping
- **Rota visual**: Linha conectando origem → barco → destino
- **Marcadores de porto**: Verde (origem), Vermelho (destino)
- **Overlay de progresso**: Card flutuante com % da viagem

### Componente BoatMarker

Criado em `src/components/BoatMarker/BoatMarker.tsx`:

```typescript
<BoatMarker
  coordinate={{latitude: -3.1, longitude: -60.0}}
  title="Expresso Amazonas"
  description="Velocidade: 45 km/h"
  rotation={45} // Direção do barco
/>
```

## 🚀 Próximas Melhorias (Futuro)

1. **Animação do barco**: Transição suave entre posições
2. **Rotas otimizadas**: Usar Directions API para rotas reais do rio
3. **Câmera dinâmica**: Seguir o barco automaticamente
4. **Cluster de marcadores**: Agrupar múltiplos barcos
5. **Camada de tráfego**: Mostrar condições do rio
6. **Mapas offline**: Cachear mapas para uso sem internet

## 📚 Documentação Útil

- [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform](https://developers.google.com/maps)
- [Maps SDK for Android](https://developers.google.com/maps/documentation/android-sdk)

## ⚠️ Importante

- **Nunca commite a API Key** no Git (já está no .gitignore)
- **Restrinja a API Key** em produção para evitar uso não autorizado
- **Monitore o uso** no Google Cloud Console para evitar surpresas

---

Pronto! Seu Google Maps está configurado e funcionando! 🎉
