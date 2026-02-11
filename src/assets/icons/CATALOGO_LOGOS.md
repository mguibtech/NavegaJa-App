# 📦 Catálogo Completo de Logos NavegaJá

## ✅ 16 Arquivos SVG Gerados

### 🎨 Logos Principais (6 arquivos)

| Arquivo | Tamanho | Uso Recomendado | Preview |
|---------|---------|-----------------|---------|
| **logo-principal.svg** | 200x200 | Splash, Onboarding, Marketing | Logo completa com ondas e círculo gradiente |
| **logo-simplificado.svg** | 200x200 | Tab bar, Loading, Ícones pequenos | Versão minimalista clean |
| **logo-tipografia.svg** | 300x200 | Apresentações, Documentos | Logo + texto "NavegaJá" |
| **app-icon.svg** | 1024x1024 | App/Play Store, Ícone do app | Quadrado com fundo gradiente |
| **logo-mono.svg** | 200x200 | Impressão P&B, Documentos | Versão monocromática |
| **logo-horizontal.svg** | 400x120 | Headers, Banners, Rodapés | Logo horizontal com texto |

---

### 🆕 Logos Adicionais (10 arquivos)

| Arquivo | Tamanho | Uso Recomendado | Descrição |
|---------|---------|-----------------|-----------|
| **icon-circular.svg** | 512x512 | Ícones médios, PWA | Ícone circular simples |
| **icon-barco.svg** | 512x512 | Ilustrações, Marketing | Barco grande e destacado |
| **logo-flat.svg** | 200x200 | UI moderna, Dashboards | Design flat/material |
| **badge-circular.svg** | 300x300 | Certificados, Selos | Badge com borda e texto em arco |
| **logo-outline.svg** | 200x200 | Wireframes, Esboços | Versão apenas contornos |
| **logo-documento.svg** | 400x400 | Documentos oficiais, PDFs | Fundo branco com texto completo |
| **icon-notification.svg** | 96x96 | Push notifications, Badges | Ícone super simplificado |
| **logo-invertido.svg** | 200x200 | Modo escuro, Fundos escuros | Versão clara para dark mode |
| **splash-animado.svg** | 300x300 | Splash screen com animação | SVG com animações CSS |
| **favicon.svg** | 16x16 | Favicon, Ícones tiny | Otimizado para 16x16px |

---

## 📐 Guia de Uso por Contexto

### Mobile App (React Native)

#### Splash Screen
```typescript
// Use: splash-animado.svg ou app-icon.svg
<AppIcon width={200} height={200} />
```

#### Onboarding
```typescript
// Use: logo-principal.svg
<LogoPrincipal width={150} height={150} />
```

#### Tab Bar
```typescript
// Use: logo-simplificado.svg ou icon-notification.svg
<LogoSimplificado width={24} height={24} />
```

#### Header
```typescript
// Use: logo-horizontal.svg
<LogoHorizontal width={200} height={60} />
```

#### Loading Indicator
```typescript
// Use: logo-simplificado.svg ou icon-circular.svg
<LogoSimplificado width={80} height={80} />
```

---

### Website/PWA

#### Favicon
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
```

#### Hero Section
```html
<!-- Use: logo-principal.svg ou icon-barco.svg -->
<img src="/logo-principal.svg" alt="NavegaJá" width="300">
```

#### Footer
```html
<!-- Use: logo-horizontal.svg -->
<img src="/logo-horizontal.svg" alt="NavegaJá" width="250">
```

#### Dark Mode
```html
<!-- Use: logo-invertido.svg -->
<img src="/logo-invertido.svg" alt="NavegaJá" class="dark-mode">
```

---

### Marketing/Documentos

#### Apresentação PowerPoint
- **Capa**: logo-tipografia.svg
- **Rodapé**: logo-horizontal.svg (pequeno)

#### Documentos Word/PDF
- **Cabeçalho**: logo-documento.svg
- **Selo/Badge**: badge-circular.svg

#### Cartões de Visita
- **Frente**: logo-principal.svg
- **Verso**: logo-horizontal.svg

#### Impressão P&B
- **Qualquer material**: logo-mono.svg ou logo-outline.svg

---

## 🎨 Variações de Estilo

### Por Estilo Visual

| Estilo | Arquivos | Quando Usar |
|--------|----------|-------------|
| **Completo/Rico** | logo-principal.svg, app-icon.svg | Marketing, Splash |
| **Minimalista** | logo-simplificado.svg, icon-notification.svg | UI, Ícones |
| **Flat/Moderno** | logo-flat.svg | Dashboards, Apps |
| **Outline** | logo-outline.svg | Wireframes, Sketches |
| **Com Texto** | logo-tipografia.svg, logo-horizontal.svg | Documentos |
| **Decorativo** | badge-circular.svg, icon-barco.svg | Certificados |
| **Dark Mode** | logo-invertido.svg | Modo escuro |

---

## 📱 App Icons - Tamanhos Necessários

### iOS (use app-icon.svg como base)
```
1024x1024 - App Store
180x180 - iPhone @3x
120x120 - iPhone @2x
167x167 - iPad Pro
152x152 - iPad @2x
76x76 - iPad
```

### Android (use app-icon.svg como base)
```
512x512 - Play Store
192x192 - xxxhdpi
144x144 - xxhdpi
96x96 - xhdpi
72x72 - hdpi
48x48 - mdpi
```

### PWA/Web (use icon-circular.svg ou app-icon.svg)
```
512x512 - Manifest
192x192 - Manifest
180x180 - Apple Touch Icon
32x32 - Favicon
16x16 - Favicon (ou use favicon.svg)
```

---

## 🎯 Recomendações por Plataforma

### React Native App
1. **Componente TypeScript** (Logo.tsx) ← **RECOMENDADO**
2. SVG files diretos (requer react-native-svg-transformer)

### Website/PWA
1. SVG files diretos ← **RECOMENDADO**
2. Converter para PNG em múltiplos tamanhos (usar imagemagick)

### Documentos/Impressão
1. SVG para vetorial ← **RECOMENDADO**
2. PDF de alta resolução (converter SVG → PDF)

---

## 🛠️ Ferramentas de Conversão

### SVG → PNG (múltiplos tamanhos)
```bash
# ImageMagick
convert logo-principal.svg -resize 512x512 logo-512.png
convert logo-principal.svg -resize 192x192 logo-192.png

# Online
https://cloudconvert.com/svg-to-png
```

### SVG → ICO (favicon)
```bash
# ImageMagick
convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico

# Online
https://convertio.co/svg-ico/
```

### SVG Optimizer
```bash
# SVGO
npm install -g svgo
svgo logo-principal.svg -o logo-principal-optimized.svg

# Online
https://jakearchibald.github.io/svgomg/
```

---

## 📊 Comparação de Tamanhos

| Arquivo | Tamanho Estimado | Complexidade |
|---------|------------------|--------------|
| favicon.svg | ~500 bytes | Muito baixa |
| logo-mono.svg | ~1 KB | Baixa |
| logo-simplificado.svg | ~1.5 KB | Baixa |
| logo-principal.svg | ~2 KB | Média |
| app-icon.svg | ~2.5 KB | Média |
| badge-circular.svg | ~3 KB | Alta |
| splash-animado.svg | ~4 KB | Muito alta (animações) |

*Tamanhos podem variar após minificação/otimização*

---

## ✨ Features Especiais

### splash-animado.svg
- ✅ Animações CSS integradas
- ✅ Ondas animadas
- ✅ Barco com fade-in sequencial
- ✅ Bandeira com movimento
- ✅ Glow effect pulsante

**Uso:**
```html
<img src="splash-animado.svg" alt="Carregando...">
<!-- Animação começa automaticamente -->
```

### badge-circular.svg
- ✅ Texto em arco (path text)
- ✅ Estrelas decorativas
- ✅ Borda gradiente
- ✅ Perfeito para certificados

---

## 🎨 Paleta de Cores em Todos os Arquivos

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | #0B5D8A | Azul principal |
| Primary Dark | #075985 | Azul escuro |
| Secondary | #22874A | Verde |
| Accent | #E8960C | Dourado |
| Accent Light | #FBBF24 | Dourado claro |
| White | #FFFFFF | Branco |
| Gray | #6B7280 | Cinza texto |
| Border | #E5E7EB | Cinza borda |

---

## 📄 Checklist de Uso

### Para App Mobile
- [ ] Copiar SVGs para `/assets/`
- [ ] Instalar `react-native-svg`
- [ ] Usar componente Logo.tsx
- [ ] Gerar PNGs para app icons (iOS + Android)
- [ ] Testar em ambas plataformas

### Para Website
- [ ] Copiar SVGs para `/public/`
- [ ] Adicionar favicon.svg
- [ ] Configurar manifest.json com ícones
- [ ] Testar em diferentes navegadores
- [ ] Validar modo escuro (logo-invertido.svg)

### Para Documentos
- [ ] Usar logo-documento.svg em headers
- [ ] Usar badge-circular.svg para certificados
- [ ] Usar logo-mono.svg para impressão P&B
- [ ] Converter para PDF de alta resolução

---

## 🆘 Troubleshooting

### SVG não carrega no React Native
- Instale: `npm install react-native-svg`
- Use componente TypeScript (Logo.tsx) em vez de arquivo SVG

### SVG aparece pixelado
- SVG é vetorial, não deve pixelar
- Se aparecer borrado, verifique viewBox e dimensões
- Para React Native, use componente em vez de Image

### Cores erradas no dark mode
- Use `logo-invertido.svg` para fundos escuros
- Ou ajuste opacity dos elementos no SVG original

### Animações não funcionam
- Animações CSS em SVG só funcionam em navegadores
- Para React Native, use Reanimated para animar

---

## 📚 Recursos Adicionais

- **Documentação**: LOGO_USAGE.md
- **Showcase**: NavegaJa-Logos.html
- **Componente**: src/components/atoms/Logo.tsx
- **Exemplos**: src/screens/Auth/OnboardingScreen-with-logo.tsx

---

**16 logos prontas para qualquer situação! 🚤**

Escolha a versão certa para cada contexto e mantenha a identidade visual consistente em todas as plataformas.
