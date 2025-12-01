import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminSvgo from 'imagemin-svgo';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeImages() {
  const inputDir = 'src/assets/backgrounds';
  const outputDir = 'src/assets/backgrounds/optimized';

  // Crear directorio de salida si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🔍 Analizando imágenes actuales...');

  // Obtener archivos de imagen
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(png|jpg|jpeg|svg)$/i.test(file))
    .map(file => path.join(inputDir, file));

  console.log(`📁 Encontradas ${files.length} imágenes para optimizar`);

  for (const file of files) {
    const filename = path.basename(file);
    const stats = fs.statSync(file);
    const originalSize = (stats.size / 1024 / 1024).toFixed(2);

    console.log(`📊 ${filename}: ${originalSize} MB`);
  }

  console.log('\n🚀 Optimizando imágenes...');

  const results = await imagemin([`${inputDir}/*.{png,jpg,jpeg,svg}`], {
    destination: outputDir,
    plugins: [
      imageminJpegtran({ progressive: true }),
      imageminPngquant({
        quality: [0.6, 0.8], // Calidad entre 60-80%
        speed: 1 // Velocidad más lenta pero mejor compresión
      }),
      imageminSvgo({
        plugins: [
          { removeViewBox: false },
          { cleanupNumericValues: { floatPrecision: 2 } }
        ]
      })
    ]
  });

  console.log(`✅ Optimizadas ${results.length} imágenes`);

  // Mostrar resultados
  console.log('\n📈 Resultados de optimización:');
  results.forEach(result => {
    const filename = path.basename(result.sourcePath);
    const originalPath = result.sourcePath;
    const optimizedPath = result.destinationPath;

    const originalStats = fs.statSync(originalPath);
    const optimizedStats = fs.statSync(optimizedPath);

    const originalSize = (originalStats.size / 1024 / 1024).toFixed(2);
    const optimizedSize = (optimizedStats.size / 1024 / 1024).toFixed(2);
    const savings = (((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`${filename}: ${originalSize}MB → ${optimizedSize}MB (${savings}% ahorro)`);
  });

  console.log('\n💡 Las imágenes optimizadas están en src/assets/backgrounds/optimized/');
  console.log('🔄 Reemplaza las originales cuando estés listo.');
}

optimizeImages().catch(console.error);
