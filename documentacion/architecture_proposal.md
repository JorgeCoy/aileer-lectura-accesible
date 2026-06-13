# Propuesta de Arquitectura Escalable: aLeer v2.0

Esta propuesta detalla cómo evolucionar el prototipo actual hacia una plataforma educativa robusta, multi-colegio y multi-asignatura.

## 1. Visión General: El Modelo Jerárquico

Para soportar desde un profesor particular hasta una red de colegios, necesitamos una estructura jerárquica clara pero flexible.

### Entidades Principales
1.  **Organización (Colegio/Institución):** El contenedor principal.
2.  **Usuarios:** Personas con roles específicos (Admin, Docente, Estudiante).
3.  **Clases (Materias/Cursos):** La unidad donde ocurre la enseñanza (ej: "Biología 1ro A").
4.  **Asignaciones (Tareas):** El vínculo entre un contenido (Texto) y una Clase.

---

## 2. Modelo de Datos Relacional

Este esquema permite la escalabilidad "Muchos a Muchos" que solicitas.

### A. Usuarios (`Users`)
-   `id`: UUID
-   `email`: String (Único)
-   `role`: Enum (`admin`, `teacher`, `student`)
-   `organization_id`: UUID (Opcional, para vincular a un colegio)

### B. Clases (`Classes`)
Representa una materia específica dictada por un profesor.
-   `id`: UUID
-   `name`: String (ej: "Música - Nivel 1")
-   `teacher_id`: UUID (Dueño de la clase)
-   `organization_id`: UUID
-   `join_code`: String (Código único de 6 dígitos para unirse)

### C. Inscripciones (`Enrollments`)
La tabla pivote que permite a un estudiante tener muchas materias.
-   `student_id`: UUID
-   `class_id`: UUID
-   `status`: Enum (`active`, `archived`)

### D. Asignaciones (`Assignments`)
-   `id`: UUID
-   `class_id`: UUID
-   `text_id`: UUID (Referencia al contenido)
-   `config`: JSON (Velocidad, técnica, etc.)
-   `due_date`: Date

---

## 3. Flujos de Usuario (User Journeys)

### El Estudiante (Multi-Materia)
El estudiante es el centro. Su experiencia debe unificar todas sus obligaciones.

1.  **Registro/Login:** Un único usuario para todo.
2.  **Unirse a Clase:**
    -   El estudiante ingresa un código (ej: `BIO-123`).
    -   El sistema crea un `Enrollment` en la clase de Biología.
    -   Repite el proceso para Música (`MUS-456`).
3.  **Dashboard Unificado:**
    -   El sistema consulta: *"Trae todas las asignaciones activas de todas las clases donde estoy inscrito"*.
    -   Resultado: Una lista mixta ordenada por fecha de entrega.
        -   📅 *Para mañana:* Leer "La Célula" (Biología)
        -   📅 *Para el viernes:* Leer "Historia del Jazz" (Música)

### El Docente (Especialista)
El docente gestiona sus "silos" de conocimiento.

1.  **Crear Clase:** El profesor de Biología crea "Biología 1ro A".
2.  **Invitar:** Comparte el código `BIO-123` en el pizarrón.
3.  **Asignar:** Selecciona un texto de la biblioteca y lo asigna a "Biología 1ro A".
4.  **Monitorear:** Ve solo el progreso de sus alumnos en **su** materia.

### El Colegio (Administrador)
(Para una etapa futura, pero vital para escalar)
-   Puede ver todas las clases del colegio.
-   Puede gestionar altas/bajas de profesores y alumnos.
-   Obtiene métricas globales ("¿Qué nivel de lectura tiene 3er grado?").

---

## 4. Estrategia de Implementación (Roadmap)

### Fase 1: Multi-Clase (Lo que haremos ahora)
Adaptar el prototipo actual para soportar la lógica "Muchos a Muchos" en el Frontend.
-   [ ] **Backend Simulado:** Actualizar `MockBackendService` para soportar `Enrollments`.
-   [ ] **Estudiante:** Implementar "Unirse a Clase" real.
-   [ ] **Dashboard:** Filtrar tareas por las clases inscritas del estudiante.

### Fase 2: Autenticación Real
-   Implementar Firebase Auth o Supabase.
-   Permitir que un estudiante guarde su progreso en la nube.

### Fase 3: Multi-Tenant (Colegios)
-   Agregar el concepto de `organization_id` para separar datos entre colegios distintos.

---

## 5. Conclusión
Esta arquitectura permite que:
1.  **Un estudiante** tenga N materias.
2.  **Un profesor** tenga N clases.
3.  **Un colegio** tenga N profesores y estudiantes.
4.  **Un niño rural** pueda estudiar sin internet en casa y sincronizar en el colegio.
5.  Todo conviva en una sola plataforma sin mezclar datos indebidos.

---

## 6. Estrategia Offline-First (Rural)
Para estudiantes sin conexión permanente (fincas, zonas rurales), la arquitectura debe ser "Local Primero".

### A. Infraestructura PWA (Ya iniciada)
El proyecto ya cuenta con `vite-plugin-pwa`. Esto garantiza que la **interfaz (UI)** cargue sin internet.
-   **Service Workers:** Interceptan la red y sirven la app desde el caché.
-   **Assets:** Fuentes, iconos y scripts se guardan en el dispositivo.

### B. Datos Locales (IndexedDB)
`localStorage` (5MB) es insuficiente para libros y multimedia. Usaremos **IndexedDB** (cientos de MB/GB).
-   **Librería Local:** Al tener internet (en el colegio/pueblo), el estudiante descarga sus asignaciones.
-   **Lectura Offline:** En casa, lee y completa ejercicios. El progreso se guarda en IndexedDB.

### C. Sincronización (Sync Manager)
Implementaremos un "Gestor de Sincronización" que detecte la red.
1.  **Online:** Descarga nuevas tareas y sube el progreso pendiente.
2.  **Offline:** Acumula eventos (ej: "Leyó pág 5", "Completó quiz").
3.  **Re-conexión:** Al volver al colegio, el sistema sube todo automáticamente.

---

## 7. Modelos de Despliegue y Costos

Para llevar esto a un colegio real, existen dos caminos principales según su conectividad:

### Opción A: Plan "aLeer Colegio" (Institucional)
El software vive en internet (AWS/Firebase). El colegio paga una suscripción.
-   **Instalación:** Cero. Solo entran a `www.aleer.com`.
-   **Costos:**
    -   *Infraestructura:* Bajo (~$0.01 por usuario/mes en Firebase).
    -   *Mantenimiento:* Centralizado (actualizas una vez, todos reciben la mejora).
-   **Ideal para:** Colegios con internet (aunque sea intermitente) y dispositivos propios o de estudiantes.

### Opción B: Plan "aLeer Sin Fronteras" (Offline)
Para colegios **sin internet absoluto**.
-   **Instalación:** Se entrega un mini-servidor (Raspberry Pi o PC vieja) que emite su propia red Wi-Fi local ("Red aLeer").
-   **Funcionamiento:** Los estudiantes se conectan a ese Wi-Fi y la app carga desde ahí.
-   **Costos:**
    -   *Hardware:* Único (~$100 USD por servidor).
    -   *Mantenimiento:* Complejo (requiere visita técnica para actualizar).
-   **Ideal para:** Escuelas rurales profundas sin señal 4G/Fibra.
