import { useState, useEffect } from "react";
import { speakWord, stopSpeech, estimateWordDuration } from "../utils/speech";

const useSpeech = ({
  currentWord,
  isPlaying,
  isCountingDown,
  speed,
  maxSpeed = 800,
  onWordEnd, // ✅ Nueva prop callback
  voiceEnabled, // ✅ Recibir estado
  setVoiceEnabled // ✅ Recibir setter
}) => {
  // const [voiceEnabled, setVoiceEnabled] = useState(false); // ❌ Eliminado estado interno

  // ✅ Desactivar voz si la velocidad es muy alta (configuración general)
  useEffect(() => {
    if (speed < maxSpeed) {
      setVoiceEnabled(false);
    }
  }, [speed, maxSpeed, setVoiceEnabled]);

  // ✅ Desactivar voz si la velocidad es muy rápida para la pronunciación (estimación)
  useEffect(() => {
    const wordDuration = estimateWordDuration("a"); // palabra más corta
    if (speed < wordDuration * 0.8) {
      setVoiceEnabled(false);
    }
  }, [speed, setVoiceEnabled]);

  // ✅ Efecto que reproduce la palabra en voz alta
  useEffect(() => {
    // ✅ No ejecutar si está contando
    if (isCountingDown) return;

    if (isPlaying && voiceEnabled && currentWord) {
      // console.log("🚀 Reproduce voz para palabra:", currentWord);
      speakWord(currentWord, 'es-ES', onWordEnd); // ✅ Pasar callback
    }
  }, [currentWord, isPlaying, voiceEnabled, isCountingDown, onWordEnd]);

  // ✅ Efecto que detiene la voz inmediatamente si se inhabilita
  useEffect(() => {
    if (!voiceEnabled) {
      // console.log("🚀 Detener Voz");
      stopSpeech();
    }
  }, [voiceEnabled]);

  // ✅ Efecto que detiene la voz al desmontar
  useEffect(() => {
    return () => {
      // console.log("🚀 Detiene la voz al desmontar");
      stopSpeech();
    };
  }, []);

  return {}; // ✅ Ya no necesitamos devolver el estado
};

export default useSpeech;
