import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import fs from 'fs';

async function optimizePWAIcons() {
  console.log('🔍 Optimizando iconos del PWA...');

  const results = await imagemin(['public/*.png'], {
    destination: 'public/optimized',
    plugins: [
      imageminPngquant({
        quality: [0.8, 0.9], // Mejor calidad para iconos (80-90%)
        speed: 1
      })
    ]
  });

  console.log(`✅ Optimizados ${results.length} iconos del PWA`);

  // Mostrar resultados
  console.log('\n📈 Resultados de optimización:');
  results.forEach(result => {
    const filename = result.sourcePath.split('/').pop();
    const originalStats = fs.statSync(result.sourcePath);
    const optimizedStats = fs.statSync(result.destinationPath);

    const originalSize = (originalStats.size / 1024).toFixed(1);
    const optimizedSize = (optimizedStats.size / 1024).toFixed(1);
    const savings = (((originalStats.size - optimizedStats.size) / originalStats.size) * 100).toFixed(1);

    console.log(`${filename}: ${originalSize}KB → ${optimizedSize}KB (${savings}% ahorro)`);
  });

  console.log('\n💡 Los iconos optimizados están en public/optimized/');
  console.log('🔄 Reemplaza los originales cuando estés listo.');
}

optimizePWAIcons().catch(console.error);
