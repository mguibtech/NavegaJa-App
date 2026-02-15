# 📦 Setup do Sistema de Encomendas v2.0

## Dependências Necessárias

### 1. Scanner QR Code (Opcional - para Capitães)

#### Instalação

```bash
# Vision Camera (biblioteca principal)
yarn add react-native-vision-camera

# Plugin para escanear códigos
yarn add vision-camera-code-scanner
```

#### Configuração Android

**android/app/src/main/AndroidManifest.xml**
```xml
<manifest>
  <!-- Adicionar permissões -->
  <uses-permission android:name="android.permission.CAMERA" />

  <application>
    <!-- ... -->
  </application>
</manifest>
```

**android/app/build.gradle**
```gradle
android {
  // Adicionar
  buildFeatures {
    dataBinding true
  }
}
```

#### Configuração iOS

**ios/navegaJaAPP/Info.plist**
```xml
<dict>
  <!-- Adicionar descrição de uso da câmera -->
  <key>NSCameraUsageDescription</key>
  <string>O NavegaJá precisa acessar sua câmera para escanear QR Codes das encomendas</string>

  <key>NSMicrophoneUsageDescription</key>
  <string>O NavegaJá não usa o microfone, mas a biblioteca de câmera requer essa permissão</string>
</dict>
```

**ios/Podfile**
```ruby
target 'navegaJaAPP' do
  # ...

  # Adicionar permissões da câmera
  permissions_path = '../node_modules/react-native-permissions/ios'
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
end
```

Depois rodar:
```bash
cd ios && pod install && cd ..
```

#### Ativar o Scanner

No arquivo `src/screens/app/ScanShipmentQRScreen.tsx`, **descomentar**:

1. Imports:
```typescript
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';
```

2. Lógica de permissão (linha ~28):
```typescript
const status = await Camera.requestCameraPermission();
setHasPermission(status === 'granted');
// ... resto do código
```

3. Camera Component e CodeScanner (linha ~50):
```typescript
const device = useCameraDevice('back');

const codeScanner = useCodeScanner({
  codeTypes: ['qr'],
  onCodeScanned: codes => {
    // ... código
  },
});
```

4. Camera View (substituir placeholder UI):
```typescript
{device && hasPermission ? (
  <Camera
    style={StyleSheet.absoluteFill}
    device={device}
    isActive={isScanning}
    codeScanner={codeScanner}
  />
) : (
  // Loading UI
)}
```

5. Overlay (descomente a seção no final)

---

### 2. Captura de Fotos (Opcional)

A biblioteca `react-native-image-picker` já está no projeto mas não instalada.

#### Instalação

```bash
yarn add react-native-image-picker
```

#### Configuração Android

**android/app/src/main/AndroidManifest.xml**
```xml
<manifest>
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

  <application>
    <!-- ... -->
  </application>
</manifest>
```

#### Configuração iOS

**ios/navegaJaAPP/Info.plist**
```xml
<dict>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>O NavegaJá precisa acessar sua galeria para selecionar fotos das encomendas</string>

  <key>NSCameraUsageDescription</key>
  <string>O NavegaJá precisa acessar sua câmera para tirar fotos das encomendas</string>
</dict>
```

```bash
cd ios && pod install && cd ..
```

#### Ativar PhotoPicker

No arquivo `src/components/PhotoPicker/PhotoPicker.tsx`, **descomentar**:

1. Import (linha ~2):
```typescript
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
```

2. Função handleSelectPhoto (linha ~48):
```typescript
async function handleSelectPhoto() {
  const options = {
    mediaType: 'photo' as const,
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
  };

  Alert.alert('Selecionar Foto', 'Escolha uma opção', [
    {
      text: 'Câmera',
      onPress: async () => {
        const result = await launchCamera(options);
        if (result.assets && result.assets[0]) {
          addPhoto(result.assets[0]);
        }
      },
    },
    {
      text: 'Galeria',
      onPress: async () => {
        const result = await launchImageLibrary(options);
        if (result.assets && result.assets[0]) {
          addPhoto(result.assets[0]);
        }
      },
    },
    {text: 'Cancelar', style: 'cancel'},
  ]);
}
```

---

### 3. Deep Links (Validação de Entrega)

#### Configuração Android

**android/app/src/main/AndroidManifest.xml**
```xml
<activity
  android:name=".MainActivity"
  android:launchMode="singleTask">

  <!-- Adicionar intent-filter -->
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <!-- Deep Link: navegaja://shipment/validate?code=XXX&pin=XXXXXX -->
    <data android:scheme="navegaja" android:host="shipment" />
  </intent-filter>
</activity>
```

#### Configuração iOS

**ios/navegaJaAPP/Info.plist**
```xml
<dict>
  <!-- Adicionar URL Types -->
  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLSchemes</key>
      <array>
        <string>navegaja</string>
      </array>
      <key>CFBundleURLName</key>
      <string>com.navegaja.app</string>
    </dict>
  </array>
</dict>
```

#### Configuração React Navigation

**src/routes/index.tsx** (ou onde está o NavigationContainer)

```typescript
import {LinkingOptions} from '@react-navigation/native';

const linking: LinkingOptions<AppStackParamList> = {
  prefixes: ['navegaja://', 'https://navegaja.com.br'],
  config: {
    screens: {
      ValidateDelivery: {
        path: 'shipment/validate',
        parse: {
          trackingCode: (code: string) => code,
          pin: (pin: string) => pin,
        },
      },
      // ... outras rotas
    },
  },
};

<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

#### Testar Deep Link

**Android (ADB):**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "navegaja://shipment/validate?trackingCode=NJ2024000123&pin=123456"
```

**iOS (Simulador):**
```bash
xcrun simctl openurl booted "navegaja://shipment/validate?trackingCode=NJ2024000123&pin=123456"
```

---

## Fluxo Completo v2.0

### 1. Criação e Pagamento
- ✅ Usuário cria encomenda → `PENDING`
- ✅ Usuário confirma pagamento (upload comprovante opcional) → `PAID`

### 2. Coleta pelo Capitão
- ✅ **Opção 1:** Capitão escaneia QR Code → `COLLECTED`
- ✅ **Opção 2:** Capitão clica "Coletar Manualmente" → `COLLECTED`
- Foto de coleta opcional

### 3. Transporte (Auto)
- ✅ Sistema atualiza quando viagem parte → `IN_TRANSIT`
- ✅ Sistema atualiza quando viagem chega → `ARRIVED`

### 4. Entrega
- ✅ Capitão marca "Saiu para Entrega" → `OUT_FOR_DELIVERY`
- ✅ Destinatário valida com PIN 6 dígitos → `DELIVERED`
  - Deep link: `navegaja://shipment/validate?code=XXX&pin=XXXXXX`
  - Ou acessa tela ValidateDeliveryScreen manualmente
- ✅ NavegaCoins creditados ao remetente

### 5. Avaliação
- ✅ Remetente avalia a entrega (3 ratings + comentário)

---

## Checklist de Implementação

### Core (Já Implementado) ✅
- [x] 8 estados de shipment
- [x] Types v2.0 completos
- [x] 4 novos endpoints API
- [x] 4 novos hooks (useConfirmPayment, useCollectShipment, etc)
- [x] ShipmentDetailsScreen atualizada
- [x] ValidateDeliveryScreen criada
- [x] ScanShipmentQRScreen criada (placeholder)
- [x] Navegação configurada

### Dependências Opcionais
- [ ] react-native-vision-camera (Scanner QR)
- [ ] vision-camera-code-scanner (Plugin)
- [ ] react-native-image-picker (já preparado, instalar)
- [ ] Deep link configurado (AndroidManifest + Info.plist)

### Testes
- [ ] Criar encomenda com fotos
- [ ] Confirmar pagamento
- [ ] Escanear QR Code (capitão)
- [ ] Validar entrega com PIN
- [ ] Receber NavegaCoins
- [ ] Avaliar entrega
- [ ] Deep link funcionando

---

## Comandos Úteis

### Rebuild após configurações nativas

```bash
# Android
cd android && ./gradlew clean && cd ..
yarn android

# iOS
cd ios && pod install && cd ..
yarn ios
```

### Verificar TypeScript
```bash
npx tsc --noEmit
```

### Verificar ESLint
```bash
yarn lint
```

---

## Troubleshooting

### Camera não funciona
- Verifique permissões no AndroidManifest.xml / Info.plist
- Rode `pod install` após adicionar permissões iOS
- Rebuild completo do app

### Deep link não abre o app
- Android: Verifique se o intent-filter está correto
- iOS: Verifique CFBundleURLTypes
- Teste com comandos ADB/xcrun primeiro

### Upload de fotos falha
- Verifique se presigned URLs estão sendo geradas corretamente
- Confirme que S3 bucket tem CORS configurado
- Verifique permissões de storage no dispositivo

---

## Próximos Passos

1. **Instalar dependências opcionais** (scanner + image picker)
2. **Configurar permissões nativas** (Android + iOS)
3. **Descomentar código** nos arquivos indicados
4. **Configurar deep links** para validação
5. **Testar fluxo completo** em dispositivo real
6. **Ajustar UI/UX** conforme feedback

---

**Status:** Core v2.0 100% implementado ✅
**TypeScript:** 0 erros ✅
**Pronto para:** Instalação de dependências e testes
