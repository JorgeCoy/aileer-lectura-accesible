// src/config/modes.js

export const modes = {
  adult: {
    id: "adult",
    label: "Modo Adulto",
    subtitle: "Lectura rápida y sin distracciones",
    defaultTheme: "minimalist",
    icon: "👨‍💻",
  },
  teacher: {
    id: "teacher",
    label: "Modo Profesor",
    subtitle: "Lectura rápida y herramientas para docentes",
    defaultTheme: "professional",
    icon: "📚",
  },
  child: {
    id: "child",
    label: "Modo Niños",
    subtitle: "Lectura divertida y segura",
    defaultTheme: "zen",
    icon: "🧒",
  },
  baby: {
    id: "baby",
    label: "Modo Bebé",
    subtitle: "Lectura simple y visual para los más pequeños",
    defaultTheme: "vintage",
    icon: "👶",
  },
  ninos_tdah: {
    id: "ninos_tdah",
    label: "Modo Niños con TDAH",
    subtitle: "Lectura con pausas y enfoque especial",
    defaultTheme: "focus",
    icon: "🧠",
  },
  preview: {
    id: "preview",
    label: "Vista Previa",
    subtitle: "Configuración de lectura",
    defaultTheme: "minimalist",
    icon: "👁️",
  },
};

// ✅ Esta línea debe estar presente
export const getModeById = (id) => modes[id];