import { useState, useEffect } from "react";
import { speakWord, stopSpeech, estimateWordDuration, getVoices } from "../utils/speech";

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
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  // ✅ Cargar voces disponibles
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getVoices();
      setVoices(availableVoices);

      // Seleccionar una voz por defecto (preferiblemente Google Español o Microsoft Helena/Sabina)
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('es') && (v.name.includes('Google') || v.name.includes('Microsoft'))) || availableVoices.find(v => v.lang.startsWith('es'));
        if (defaultVoice) {
          setSelectedVoice(defaultVoice);
        }
      }
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  // ✅ Calcular tasa de velocidad (rate) basada en ms/palabra
  // Base: 300ms/palabra ~= rate 1.0
  // Si speed = 600ms (más lento), rate = 0.5
  // Si speed = 150ms (más rápido), rate = 2.0
  const speechRate = Math.min(Math.max(300 / speed, 0.1), 10);

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
      speakWord(currentWord, 'es-ES', onWordEnd, speechRate, selectedVoice); // ✅ Pasar rate y voz
    }
  }, [currentWord, isPlaying, voiceEnabled, isCountingDown, onWordEnd, speechRate, selectedVoice]);

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

  return {
    voices,
    selectedVoice,
    setSelectedVoice
  };
};

export default useSpeech;
