"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onResult: (text: string) => void;
}

interface SpeechRecognitionEvent {
  results: { transcript: string }[][];
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition as SpeechRecognitionConstructor) ||
    (w.webkitSpeechRecognition as SpeechRecognitionConstructor) ||
    null;
}

export function VoiceCapture({ onResult }: Props) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const toggle = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      onResult("(Tu navegador no soporta captura de voz)");
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, onResult]);

  return (
    <button
      type="button"
      onClick={toggle}
      className={`px-3 py-3 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
        listening
          ? "bg-rose-600 text-white animate-pulse"
          : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
      }`}
      title={listening ? "Escuchando..." : "Capturar por voz"}
    >
      🎤
    </button>
  );
}
