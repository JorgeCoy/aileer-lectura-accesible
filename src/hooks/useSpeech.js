import { useState, useEffect, useRef } from "react";
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
  const wordStartTime = useRef(0);
  const timeoutRef = useRef(null);

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
  // La voz ahora se mantiene en un rango más natural (entre 0.8 y 2.0)
  // para que a velocidades muy lentas no suene como un robot distorsionado.
  const speechRate = Math.min(Math.max(300 / speed, 0.8), 2.0);

  // ✅ Desactivar voz si la velocidad es muy alta (configuración general)
  useEffect(() => {
    // Si la velocidad en WPM supera el máximo permitido (ej. 800 WPM)
    if ((60000 / speed) > maxSpeed) {
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      wordStartTime.current = Date.now();

      const handleWordEnd = () => {
        const elapsed = Date.now() - wordStartTime.current;
        const wordCount = currentWord.trim().split(/\s+/).length || 1;
        const targetTime = speed * wordCount;
        const remaining = targetTime - elapsed;

        if (remaining > 0) {
          timeoutRef.current = setTimeout(() => {
            if (onWordEnd) onWordEnd();
          }, remaining);
        } else {
          if (onWordEnd) onWordEnd();
        }
      };

      speakWord(currentWord, 'es-ES', handleWordEnd, speechRate, selectedVoice);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentWord, isPlaying, voiceEnabled, isCountingDown, speechRate, selectedVoice, speed, onWordEnd]);

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
