import { useState, useEffect } from "react";
import { speakWord, stopSpeech, estimateWordDuration } from "../utils/speech";

const useSpeech = ({ 
  currentWord, 
  isPlaying, 
  isCountingDown, 
  speed, 
  maxSpeed = 800 
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // ✅ Desactivar voz si la velocidad es muy alta (configuración general)
  useEffect(() => {
    if (speed < maxSpeed) {
      setVoiceEnabled(false);
    }
  }, [speed, maxSpeed]);

  // ✅ Desactivar voz si la velocidad es muy rápida para la pronunciación (estimación)
  useEffect(() => {
    const wordDuration = estimateWordDuration("a"); // palabra más corta
    if (speed < wordDuration * 0.8) {
      setVoiceEnabled(false);
    }
  }, [speed]);

  // ✅ Efecto que reproduce la palabra en voz alta
  useEffect(() => {
    // ✅ No ejecutar si está contando
    if (isCountingDown) return;

    if (isPlaying && voiceEnabled && currentWord) {
      console.log("🚀 Reproduce voz para palabra:", currentWord);
      speakWord(currentWord);
    }
  }, [currentWord, isPlaying, voiceEnabled, isCountingDown]);

  // ✅ Efecto que detiene la voz inmediatamente si se inhabilita
  useEffect(() => {
    if (!voiceEnabled) {
      console.log("🚀 Detener Voz");
      stopSpeech();
    }
  }, [voiceEnabled]);

  // ✅ Efecto que detiene la voz al desmontar
  useEffect(() => {
    return () => {
      console.log("🚀 Detiene la voz al desmontar");
      stopSpeech();
    };
  }, []);

  return {
    voiceEnabled,
    setVoiceEnabled
  };
};

export default useSpeech;
