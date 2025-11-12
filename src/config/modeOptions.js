// src/config/modeOptions.js
import { modes } from "./modes";

export const modeOptions = {
  adult: {
    maxSpeed: 10,
    enablePdf: true,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  teacher: {
    maxSpeed: 10,
    enablePdf: true,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  child: {
    maxSpeed: 500,
    enablePdf: false,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  baby: {
    maxSpeed: 1000,
    enablePdf: false,
    enableAutoPause: false,
    autoPauseInterval: 5000,
    autoPauseDuration: 500,
  },
  adhd: {
    maxSpeed: 200,
    enablePdf: true,
    enableAutoPause: true,
    autoPauseInterval: 3000,
    autoPauseDuration: 1000,
  },
};

// ✅ Exportar también una función para obtener el modo por ID
export const getModeById = (id) => modes[id];