import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';

async function runLighthouse() {
  console.log('🚀 Iniciando Lighthouse audit...');

  try {
    // Lanzar Chrome
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
    });

    console.log('📱 Chrome iniciado en puerto:', chrome.port);

    // Ejecutar Lighthouse
    const options = {
      logLevel: 'info',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa']
    };

    console.log('🔍 Ejecutando análisis en http://localhost:4173...');
    const runnerResult = await lighthouse('http://localhost:4173', options);

    // Cerrar Chrome
    await chrome.kill();

    // Guardar resultados
    const reportJson = runnerResult.report;
    fs.writeFileSync('lighthouse-report.json', reportJson);

    // Parsear y mostrar resultados clave
    const jsonResult = JSON.parse(reportJson);
    console.log('\n📊 RESULTADOS DEL PERFORMANCE AUDIT:');
    console.log('=' .repeat(50));

    const categories = jsonResult.categories;
    Object.keys(categories).forEach(category => {
      const score = Math.round(categories[category].score * 100);
      const title = categories[category].title;
      console.log(`${title}: ${score}/100`);
    });

    console.log('\n🎯 CORE WEB VITALS:');
    const audits = jsonResult.audits;

    if (audits['largest-contentful-paint']) {
      console.log(`LCP: ${audits['largest-contentful-paint'].displayValue}`);
    }
    if (audits['first-input']) {
      console.log(`FID: ${audits['first-input'].displayValue}`);
    }
    if (audits['cumulative-layout-shift']) {
      console.log(`CLS: ${audits['cumulative-layout-shift'].displayValue}`);
    }

    console.log('\n💾 TAMAÑO DEL BUNDLE:');
    if (audits['total-byte-weight']) {
      console.log(`Total: ${audits['total-byte-weight'].displayValue}`);
    }
    if (audits['unused-javascript']) {
      console.log(`JS no usado: ${audits['unused-javascript'].displayValue}`);
    }

    console.log('\n✅ Reporte completo guardado en lighthouse-report.json');

  } catch (error) {
    console.error('❌ Error ejecutando Lighthouse:', error.message);
  }
}

runLighthouse();









