const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../src/assets/icons/app-icon.svg');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

// Tamanhos para Android
const sizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
  console.log('🚀 Gerando ícones do app...\n');

  for (const config of sizes) {
    const folderPath = path.join(androidResPath, config.folder);

    // Criar pasta se não existir
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Gerar ic_launcher.png
    const launcherPath = path.join(folderPath, 'ic_launcher.png');
    await sharp(inputSvg)
      .resize(config.size, config.size)
      .png()
      .toFile(launcherPath);

    console.log(`✅ ${config.folder}/ic_launcher.png (${config.size}x${config.size})`);

    // Gerar ic_launcher_round.png (mesmo ícone, mas será cortado em círculo pelo Android)
    const roundPath = path.join(folderPath, 'ic_launcher_round.png');
    await sharp(inputSvg)
      .resize(config.size, config.size)
      .png()
      .toFile(roundPath);

    console.log(`✅ ${config.folder}/ic_launcher_round.png (${config.size}x${config.size})`);
  }

  console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
  console.log('📱 Os ícones estão em: android/app/src/main/res/mipmap-*');
}

generateIcons().catch(err => {
  console.error('❌ Erro ao gerar ícones:', err);
  process.exit(1);
});
