// Gera icon/adaptive-icon/splash/favicon a partir de logo-icon-square.png
// Rodar: cd tools-assets && node gen-assets.js
const sharp = require('sharp');
const path = require('path');

const SRC = path.resolve(__dirname, '../brucker-chamados/mobile/assets/logo-icon-square.png');
const OUT = path.resolve(__dirname, '../brucker-chamados/mobile/assets');
const BG = { r: 255, g: 255, b: 255, alpha: 1 }; // #FFFFFF — fundo branco para destacar preto/vermelho/amarelo da logo

async function run() {
  // 1) icon.png — 1024x1024, SEM alpha (Apple rejeita alpha)
  await sharp(SRC)
    .resize(1024, 1024, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(path.join(OUT, 'icon.png'));

  // 2) adaptive-icon.png — 1024x1024 com transparência, logo dentro do círculo central de 672px
  await sharp(SRC)
    .resize(672, 672, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 176, bottom: 176, left: 176, right: 176,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(OUT, 'adaptive-icon.png'));

  // 3) splash.png — 1284x2778, logo centrada (~40% da largura) sobre fundo escuro
  const logoBuffer = await sharp(SRC).resize(512, 512, { fit: 'contain' }).png().toBuffer();
  await sharp({
    create: { width: 1284, height: 2778, channels: 4, background: BG }
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, 'splash.png'));

  // 4) favicon.png — 48x48 com fundo escuro
  await sharp(SRC)
    .resize(48, 48, { fit: 'contain', background: BG })
    .flatten({ background: BG })
    .png()
    .toFile(path.join(OUT, 'favicon.png'));

  console.log('Assets gerados em', OUT);
}

run().catch(err => { console.error(err); process.exit(1); });
