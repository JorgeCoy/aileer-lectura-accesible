# 🎯 Alcance del Proyecto & Hoja de Ruta B2B (aLeer)

> **Visión General**: Transformar **aLeer** de una PWA de lectura accesible a una plataforma B2B EdTech de alto impacto para colegios e instituciones educativas en LATAM, bajo un modelo de licenciamiento por estudiante/año.

---

## 📌 1. Diagnóstico del Estado Actual (Fortalezas & Diferenciadores)

* **Pedagógicamente Sólido**: Catálogo de técnicas comprobadas (RSVP, Bionic Reading, Chunking, Skimming, Cloze) con impacto directo en comprensión y velocidad lectora.
* **Accesibilidad Universal (WCAG 2.1 AA)**: OpenDyslexic, lector de voz (TTS), contraste dinámico y modos adaptativos (TDAH/Dislexia).
* **Offline-First (Ventaja Competitiva en LATAM)**: Funcionamiento offline con PWA e IndexedDB, óptimo para entornos educativos con conectividad limitada.
* **Arquitectura de Datos Multi-tenant**: Estructura de Firestore basada en `schoolId -> teacherId -> classId -> studentId` con reglas de seguridad estrictas.

---

## 🚀 2. Enfoque Estratégico B2B (Colegios & Escuelas)

### 🎯 **Público Objetivo**
* **Compradores**: Rectores, Directores Académicos, Coordinadores de Inclusión/PIAR y Comités Educativos.
* **Usuarios**: Docentes de Lenguaje/Español y Estudiantes de K-12.

### 💰 **Modelo de Negocio & Pricing**
* **Suscripción Anual por Estudiante**: Tarifas por año escolar (alineadas con el presupuesto académico de los colegios), con descuentos por volumen.
* **Onboarding Automatizado**: Carga masiva de estudiantes mediante CSV o SSO institucional.

---

## ⚡ 3. Palancas de Aceleración de Ventas (Estrategias de Alto Impacto LATAM)

Para maximizar el alcance y cerrar contratos institucionales más rápido, se incorporan 5 ganchos estratégicos:

1. **Soporte Normativo al PIAR / Inclusión (Decreto 1421 / Ley de Inclusión)**:
   * Generación automática del *"Reporte de Ajustes Razonables en Lectura"* para la carpeta de inclusión del estudiante. Es el argumento n° 1 para coordinadores de inclusión.
2. **Diagnóstico Exprés de 3 Minutos (Benchmark Lector)**:
   * Evaluación diagnóstica inicial rápida que le entrega al Rector un *"Mapa de Salud Lectora"* del colegio. Ver un % alto en semáforo rojo genera la urgencia inmediata de compra.
3. **Alineación con Pruebas Estandarizadas (ICFES Saber / PISA / SIMCE)**:
   * Preguntas agrupadas por competencias oficiales (Literal, Inferencial, Crítica/Sintáctica), demostrando mejoras de puntaje en pruebas estatales.
4. **Estrategia "Freemium Docente" (Product-Led Growth)**:
   * Permite a un docente usar la plataforma gratis en 1 aula (hasta 25 alumnos). Cuando 3 o 4 docentes la usan y aman los reportes, ellos mismos solicitan el plan institucional al Rector.
5. **Boletines de Progreso para Padres de Familia (PDF con QR)**:
   * Informes mensuales sencillos para enviar a los padres. Aumenta la percepción de valor del colegio ante las familias.

---

## 🛠️ 4. Módulos Clave del Sistema (Core Product)

```mermaid
graph TD
    A[Super Admin Portal] --> B[Colegio / Tenant]
    B --> C[Panel Docente]
    B --> D[Portal Estudiante PWA]
    C --> E[Asignación de Lecturas & Quizzes]
    C --> F[Dashboard, PIAR & Reportes PDF/Excel]
    D --> G[Lector Accesible Offline]
    D --> H[Gamificación & Progreso Individual]
```

### **A. Panel Docente & Gestión Académica**
* **Asignación de Lecturas**: Asignación diferenciada por grado, tema y nivel de dificultad.
* **Evaluación de Comprensión**: Quizzes automáticos (opción múltiple y preguntas abiertas) generados por IA o catálogo.
* **Semáforo de Riesgo Lector**: Identificación oportuna de estudiantes con rezago en WPM o comprensión.
* **Reportes Exportables**: Descarga de informes individuales, grupales y de inclusión (PIAR) en PDF/Excel.

### **B. Experiencia del Estudiante (PWA Accesible)**
* **Entrenamiento Adaptativo**: Incremento gradual de WPM según desempeño.
* **Soporte de Inclusión**: Ajustes instantáneos de tipografía, tamaño, espaciado y lectura en voz alta.
* **Modo Offline**: Registro local de avances y sincronización automática al recuperar internet.

### **C. Infraestructura & Cumplimiento**
* **Habeas Data & Ley 1581 (Colombia/LATAM)**: Protocolos de protección de datos de menores y consentimiento institucional.
* **Seguridad Servidor**: Firestore Security Rules strictly scoped por rol (`teacher` / `student`).
* **Inteligencia Artificial Híbrida**: Procesamiento local mediante Web Worker (`@huggingface/transformers`) y nube opcional vía servidor.

---

## 🗺️ 5. Hoja de Ruta Priorizada (Roadmap)

### 🟢 **Fase 1: Preparación Institucional & Pilotos (En Curso)**
- [x] Reglas de seguridad de Firestore y eliminación de fallbacks locales.
- [x] Control de concurrencia en Workers de IA e higiene de datos.
- [x] Panel docente para creación de clases y seguimiento.
- [ ] Exportación de reportes en PDF/Excel (Ficha individual + Reporte PIAR).
- [ ] Módulo de carga masiva de alumnos por archivo CSV.

### 🟡 **Fase 2: Integración & Automatización (Próximo Trimestre)**
- [ ] Prueba diagnóstica de 3 minutos (Benchmark Inicial).
- [ ] Integración de SSO con Google Workspace for Education.
- [ ] Banco de lecturas categorizado por competencias ICFES / Saber.
- [ ] Módulo de licenciamiento institucional (gestión de cupos/seats activos).

### 🔴 **Fase 3: Expansión & Ecosistema (Futuro)**
- [ ] Integración con LMS (Google Classroom / Canvas).
- [ ] Soporte bilingüe completo (Español / Inglés).

> ⚠️ **Nota de Enfoque**: Se descartan desarrollos de hardware (VR/AR, eye-tracking) para concentrar el 100% de la ingeniería en funciones que impulsan la venta, satisfacción de padres y retención B2B educativa.
