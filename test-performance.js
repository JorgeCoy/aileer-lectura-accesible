#!/usr/bin/env node

/**
 * Script simple de pruebas de performance para aLeer
 * Analiza el build sin servidor para evitar dependencias complejas
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Iniciando análisis de performance - aLeer\n');

// Configuración
const config = {
  buildDir: 'dist'
};

class PerformanceTester {
  constructor() {
    this.results = {};
  }

  async runAllTests() {
    try {
      console.log('🔬 Ejecutando análisis de performance...\n');

      // Verificar que el build existe
      if (!fs.existsSync(config.buildDir)) {
        console.log('📦 Build no encontrado, ejecutando build...\n');
        const { execSync } = await import('child_process');
        execSync('npm run build', { stdio: 'inherit' });
        console.log('✅ Build completado\n');
      }

      await this.runBundleAnalysis();
      await this.runOptimizationAnalysis();

      console.log('📊 Generando reporte...\n');
      this.generateReport();

    } catch (error) {
      console.error('❌ Error en las pruebas:', error.message);
      process.exit(1);
    }
  }

  async runBundleAnalysis() {
    console.log('📊 Análisis de bundles...\n');

    const stats = {
      totalSize: 0,
      bundles: [],
      compressionRatio: 0
    };

    // Leer archivos del build
    const assetsDir = path.join(config.buildDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);

      files.forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;

        console.log(`  ${file}: ${(sizeKB).toFixed(1)} KB`);

        this.results.bundles = this.results.bundles || [];
        this.results.bundles.push({
          name: file,
          size: sizeKB,
          compressed: file.includes('.gz') || file.includes('.br')
        });
      });
    }

    // Análisis del HTML
    const htmlPath = path.join(config.buildDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      const hasPreload = htmlContent.includes('rel="preload"');
      const hasDnsPrefetch = htmlContent.includes('rel="dns-prefetch"');

      console.log(`  HTML optimizado: ${hasPreload ? '✅' : '❌'} preload hints`);
      console.log(`  HTML optimizado: ${hasDnsPrefetch ? '✅' : '❌'} DNS prefetch\n`);

      this.results.htmlOptimizations = {
        preload: hasPreload,
        dnsPrefetch: hasDnsPrefetch
      };
    }
  }

  async runOptimizationAnalysis() {
    console.log('🎯 Análisis de optimizaciones...\n');

    const assetsDir = path.join(config.buildDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));

      let totalSize = 0;
      let totalCompressed = 0;
      const bundleDetails = [];

      jsFiles.forEach(file => {
        const filePath = path.join(assetsDir, file);
        const stats = fs.statSync(filePath);
        const sizeKB = stats.size / 1024;

        totalSize += stats.size;

        // Verificar si está comprimido (gzip/brotli)
        const isCompressed = file.includes('.gz') || file.includes('.br');
        if (isCompressed) totalCompressed += stats.size;

        bundleDetails.push({
          name: file,
          size: sizeKB,
          compressed: isCompressed
        });

        console.log(`  📦 ${file}: ${sizeKB.toFixed(1)} KB ${isCompressed ? '(comprimido)' : ''}`);
      });

      const totalMB = totalSize / 1024 / 1024;
      const compressionRatio = totalCompressed > 0 ? ((totalSize - totalCompressed) / totalSize * 100) : 0;

      console.log(`\n  💾 Tamaño total JS: ${totalMB.toFixed(2)} MB`);
      if (compressionRatio > 0) {
        console.log(`  🗜️  Ratio de compresión: ${compressionRatio.toFixed(1)}%`);
      }

      // Evaluar performance
      if (totalMB < 1) {
        console.log('  ✅ Excelente tamaño (< 1MB)\n');
      } else if (totalMB < 2) {
        console.log('  🟡 Aceptable (1-2MB)\n');
      } else {
        console.log('  🔴 Requiere optimización (> 2MB)\n');
      }

      this.results.bundleAnalysis = {
        totalSize: totalMB,
        compressionRatio,
        bundles: bundleDetails
      };
    }

    // Análisis de HTML
    const htmlPath = path.join(config.buildDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      const optimizations = {
        preload: htmlContent.includes('rel="preload"'),
        dnsPrefetch: htmlContent.includes('rel="dns-prefetch"'),
        modulePreload: htmlContent.includes('rel="modulepreload"'),
        fontDisplay: htmlContent.includes('font-display'),
        seoMeta: htmlContent.includes('name="description"')
      };

      console.log('  🌐 Optimizaciones HTML:');
      Object.entries(optimizations).forEach(([key, value]) => {
        console.log(`    ${value ? '✅' : '❌'} ${key}`);
      });
      console.log('');

      this.results.htmlOptimizations = optimizations;
    }
  }

  generateReport() {
    console.log('📋 REPORTE FINAL DE PERFORMANCE - aLeer\n');
    console.log('=' .repeat(50));

    const bundle = this.results.bundleAnalysis;
    const html = this.results.htmlOptimizations;

    // Resumen ejecutivo
    console.log('🎯 RESUMEN EJECUTIVO:');
    if (bundle) {
      console.log(`   📦 Bundle total: ${bundle.totalSize?.toFixed(2)} MB`);
      console.log(`   🗜️  Compresión: ${bundle.compressionRatio?.toFixed(1) || 0}%`);
      console.log(`   📦 Bundles separados: ${bundle.bundles?.length || 0}`);
    }

    if (html) {
      const htmlScore = Object.values(html).filter(Boolean).length;
      console.log(`   🌐 Optimizaciones HTML: ${htmlScore}/5`);
    }

    // Evaluación de performance
    console.log('\n📊 EVALUACIÓN DE PERFORMANCE:');

    let score = 0;
    let maxScore = 0;

    // Bundle size score
    if (bundle?.totalSize !== undefined) {
      maxScore += 2;
      if (bundle.totalSize < 1) score += 2; // Excelente
      else if (bundle.totalSize < 2) score += 1; // Bueno
      // else score += 0; // Necesita mejora
    }

    // Compression score
    if (bundle?.compressionRatio > 50) score += 1;
    maxScore += 1;

    // HTML optimizations score
    if (html) {
      const htmlOptimizations = Object.values(html).filter(Boolean).length;
      score += Math.min(htmlOptimizations, 3); // Max 3 points for HTML
      maxScore += 3;
    }

    const finalScore = maxScore > 0 ? (score / maxScore * 100) : 0;

    if (finalScore >= 80) {
      console.log(`   🟢 Score General: ${finalScore.toFixed(0)}/100 - Excelente`);
    } else if (finalScore >= 60) {
      console.log(`   🟡 Score General: ${finalScore.toFixed(0)}/100 - Bueno`);
    } else {
      console.log(`   🔴 Score General: ${finalScore.toFixed(0)}/100 - Necesita mejora`);
    }

    // Recomendaciones específicas
    console.log('\n💡 RECOMENDACIONES:');

    if (bundle?.totalSize > 2) {
      console.log('   🔴 Reduce tamaño del bundle principal (>2MB)');
      console.log('      • Revisa dependencias no utilizadas');
      console.log('      • Implementa lazy loading adicional');
    } else if (bundle?.totalSize > 1) {
      console.log('   🟡 Monitorea crecimiento del bundle');
    } else {
      console.log('   ✅ Tamaño de bundle excelente');
    }

    if (bundle?.compressionRatio < 30) {
      console.log('   🟡 Mejora ratio de compresión');
    }

    if (html && !html.preload) {
      console.log('   🟡 Agrega preload hints para recursos críticos');
    }

    if (html && !html.fontDisplay) {
      console.log('   🟡 Agrega font-display: swap para mejor UX');
    }

    console.log('\n🎉 Análisis completado exitosamente!');
    console.log('\n💻 Para monitoreo en tiempo real:');
    console.log('   • Desarrollo: npm run monitor:perf');
    console.log('   • Con debug: agrega ?debug=perf a la URL');
    console.log('\n🔬 Para Core Web Vitals en producción:');
    console.log('   • Usa Google PageSpeed Insights');
    console.log('   • WebPageTest.org');
    console.log('   • Chrome DevTools > Lighthouse\n');
  }
}

// Ejecutar pruebas
const tester = new PerformanceTester();
tester.runAllTests().catch(console.error);
