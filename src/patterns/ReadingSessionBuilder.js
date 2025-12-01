// src/patterns/ReadingSessionBuilder.js
// Patrón Builder para configurar sesiones de lectura

export class ReadingSessionConfig {
  constructor() {
    this.speed = 250;
    this.technique = 'singleWord';
    this.fontSize = 32;
    this.fontFamily = 'sans-serif';
    this.theme = 'minimalist';
    this.voiceEnabled = false;
    this.previewMode = false;
    this.memoryExerciseMode = false;
    this.repetitions = 1;
    this.duration = null; // en minutos
    this.text = '';
    this.mode = 'adult';
    this.goals = [];
    this.rewards = [];
  }
}

export class ReadingSessionBuilder {
  constructor() {
    this.config = new ReadingSessionConfig();
  }

  // Métodos de configuración básicos
  withSpeed(speed) {
    this.config.speed = speed;
    return this;
  }

  withTechnique(technique) {
    this.config.technique = technique;
    return this;
  }

  withFontSize(size) {
    this.config.fontSize = size;
    return this;
  }

  withFontFamily(family) {
    this.config.fontFamily = family;
    return this;
  }

  withTheme(theme) {
    this.config.theme = theme;
    return this;
  }

  // Métodos de configuración avanzada
  enableVoice() {
    this.config.voiceEnabled = true;
    return this;
  }

  disableVoice() {
    this.config.voiceEnabled = false;
    return this;
  }

  enablePreview() {
    this.config.previewMode = true;
    return this;
  }

  enableMemoryExercise() {
    this.config.memoryExerciseMode = true;
    return this;
  }

  withRepetitions(count) {
    this.config.repetitions = count;
    return this;
  }

  withDuration(minutes) {
    this.config.duration = minutes;
    return this;
  }

  withText(text) {
    this.config.text = text;
    return this;
  }

  forMode(mode) {
    this.config.mode = mode;

    // Configuraciones por defecto según el modo
    const modeDefaults = {
      adult: { fontSize: 32, theme: 'minimalist' },
      child: { fontSize: 48, theme: 'zen' },
      baby: { fontSize: 64, theme: 'vintage' },
      ninos_tdah: { fontSize: 40, theme: 'focus' },
      teacher: { fontSize: 28, theme: 'professional' }
    };

    const defaults = modeDefaults[mode] || modeDefaults.adult;
    this.config.fontSize = defaults.fontSize;
    this.config.theme = defaults.theme;

    return this;
  }

  // Métodos para planes de estudio
  forBeginner() {
    return this
      .withSpeed(200)
      .withTechnique('singleWord')
      .withFontSize(40)
      .withRepetitions(2);
  }

  forIntermediate() {
    return this
      .withSpeed(300)
      .withTechnique('bionic')
      .withFontSize(32)
      .enablePreview();
  }

  forAdvanced() {
    return this
      .withSpeed(400)
      .withTechnique('spritz')
      .withFontSize(28)
      .enableMemoryExercise();
  }

  forSpeedReading() {
    return this
      .withSpeed(500)
      .withTechnique('lineFocus')
      .withFontSize(24)
      .withDuration(15);
  }

  forComprehension() {
    return this
      .withSpeed(250)
      .withTechnique('paragraphFocus')
      .enableVoice()
      .withRepetitions(3);
  }

  // Método de construcción final
  build() {
    // Validaciones
    if (this.config.speed < 50 || this.config.speed > 1000) {
      throw new Error('Speed must be between 50 and 1000 WPM');
    }

    if (this.config.repetitions < 1 || this.config.repetitions > 10) {
      throw new Error('Repetitions must be between 1 and 10');
    }

    if (this.config.duration && (this.config.duration < 1 || this.config.duration > 120)) {
      throw new Error('Duration must be between 1 and 120 minutes');
    }

    return { ...this.config }; // Retornar copia inmutable
  }

  // Método para resetear el builder
  reset() {
    this.config = new ReadingSessionConfig();
    return this;
  }
}

// Factory methods para casos comunes
export class ReadingSessionFactory {
  static createBeginnerSession(text = '') {
    return new ReadingSessionBuilder()
      .forBeginner()
      .withText(text)
      .build();
  }

  static createIntermediateSession(text = '') {
    return new ReadingSessionBuilder()
      .forIntermediate()
      .withText(text)
      .build();
  }

  static createAdvancedSession(text = '') {
    return new ReadingSessionBuilder()
      .forAdvanced()
      .withText(text)
      .build();
  }

  static createSpeedSession(text = '') {
    return new ReadingSessionBuilder()
      .forSpeedReading()
      .withText(text)
      .build();
  }

  static createComprehensionSession(text = '') {
    return new ReadingSessionBuilder()
      .forComprehension()
      .withText(text)
      .build();
  }

  static createCustomSession(options) {
    const builder = new ReadingSessionBuilder();

    if (options.mode) builder.forMode(options.mode);
    if (options.speed) builder.withSpeed(options.speed);
    if (options.technique) builder.withTechnique(options.technique);
    if (options.fontSize) builder.withFontSize(options.fontSize);
    if (options.fontFamily) builder.withFontFamily(options.fontFamily);
    if (options.theme) builder.withTheme(options.theme);
    if (options.voiceEnabled) builder.enableVoice();
    if (options.previewMode) builder.enablePreview();
    if (options.memoryExerciseMode) builder.enableMemoryExercise();
    if (options.repetitions) builder.withRepetitions(options.repetitions);
    if (options.duration) builder.withDuration(options.duration);
    if (options.text) builder.withText(options.text);

    return builder.build();
  }
}

// Adaptador para integrar con el hook existente
export class ReadingSessionAdapter {
  static adaptForHook(sessionConfig) {
    return {
      speed: sessionConfig.speed,
      fontSize: sessionConfig.fontSize,
      fontFamily: sessionConfig.fontFamily,
      theme: sessionConfig.theme,
      readingTechnique: sessionConfig.technique,
      voiceEnabled: sessionConfig.voiceEnabled,
      previewMode: sessionConfig.previewMode,
      memoryExerciseMode: sessionConfig.memoryExerciseMode,
      text: sessionConfig.text,
      repetitions: sessionConfig.repetitions,
      duration: sessionConfig.duration
    };
  }

  static adaptFromHook(hookState) {
    return new ReadingSessionBuilder()
      .withSpeed(hookState.speed)
      .withTechnique(hookState.readingTechnique)
      .withFontSize(hookState.fontSize)
      .withFontFamily(hookState.fontFamily)
      .withTheme(hookState.theme)
      .withText(hookState.text)
      .withRepetitions(hookState.repetitions || 1)
      .withDuration(hookState.duration)
      .build();
  }
}

