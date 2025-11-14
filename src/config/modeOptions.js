// src/config/modeOptions.js
import { modes } from "./modes";

export const modeOptions = {
  adult: {
    maxSpeed: 10, // Velocidad máxima para lectura visual
    minVoiceSpeed: 900, // ✅ Velocidad mínima para que la voz suene bien
    enablePdf: true,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  teacher: {
    maxSpeed: 10,
    minVoiceSpeed: 500,
    enablePdf: true,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  child: {
    maxSpeed: 500,
    minVoiceSpeed: 600, // ✅ Para niños, voz más lenta
    enablePdf: false,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  baby: {
    maxSpeed: 1000,
    minVoiceSpeed: 800, // ✅ Para bebés, voz muy lenta
    enablePdf: false,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  adhd: {
    maxSpeed: 200,
    minVoiceSpeed: 600, // ✅ Para TDAH, voz más clara
    enablePdf: true,
    enableAutoPause: true,
    autoPauseInterval: 3000,
    autoPauseDuration: 1000,
  },
};

// ✅ Exportar también una función para obtener el modo por ID
export const getModeById = (id) => modes[id];