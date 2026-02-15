# PhotoPicker Component

Componente para seleção de fotos (câmera ou galeria) com suporte para upload S3.

## 📦 Instalação

### 1. Instalar dependência

```bash
yarn add react-native-image-picker
```

ou

```bash
npm install react-native-image-picker
```

### 2. Configurar Permissões

#### iOS (ios/YourApp/Info.plist)

Adicione as permissões de câmera e galeria:

```xml
<key>NSCameraUsageDescription</key>
<string>Precisamos de acesso à câmera para você tirar fotos das encomendas</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Precisamos de acesso à galeria para você selecionar fotos das encomendas</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Precisamos de permissão para salvar fotos na galeria</string>
```

Depois rode:

```bash
cd ios && pod install && cd ..
```

#### Android (android/app/src/main/AndroidManifest.xml)

Adicione as permissões:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
```

### 3. Descomentar código no PhotoPicker.tsx

Após instalar, descomente o código nas funções:

- `openCamera()` (linhas 42-74)
- `openGallery()` (linhas 89-121)

E adicione o import no topo do arquivo:

```typescript
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
```

### 4. Rebuild do app

```bash
# iOS
yarn ios

# Android
yarn android
```

## 🚀 Uso

```tsx
import {PhotoPicker} from '@components';

function MyScreen() {
  const [photos, setPhotos] = useState([]);

  return (
    <PhotoPicker
      photos={photos}
      onPhotosChange={setPhotos}
      maxPhotos={5}
    />
  );
}
```

## 📝 Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photos` | `Array<{uri: string; type: string; name: string}>` | ✅ | - | Lista de fotos selecionadas |
| `onPhotosChange` | `(photos) => void` | ✅ | - | Callback quando fotos mudam |
| `maxPhotos` | `number` | ❌ | `5` | Número máximo de fotos |

## 🔒 Validações

- Máximo 5 fotos (configurável)
- Qualidade automática: 0.8 (80%)
- Resize automático: 1920x1920 (mantém aspect ratio)
- Tipos aceitos: JPEG, PNG

## ☁️ Upload S3

O componente é integrado com o sistema de upload S3:

1. Usuário seleciona fotos
2. App solicita presigned URLs do backend
3. Upload direto para S3 (paralelo)
4. URLs públicas são enviadas no POST /shipments

Veja `shipmentService.ts` para detalhes da implementação.

## 🛠️ Troubleshooting

### Erro: "Camera permission denied"

**Solução:** Verifique as permissões no `Info.plist` (iOS) ou `AndroidManifest.xml` (Android).

### Erro: "Module not found: react-native-image-picker"

**Solução:** Rode `yarn add react-native-image-picker` e rebuild o app.

### Fotos aparecem rotacionadas errado (iOS)

**Solução:** A biblioteca já corrige automaticamente usando metadata EXIF.

## 📚 Referências

- [react-native-image-picker docs](https://github.com/react-native-image-picker/react-native-image-picker)
- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
