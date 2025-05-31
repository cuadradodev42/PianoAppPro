"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// URLs de samples de piano reales
const PIANO_SAMPLES = {
  0: "https://tonejs.github.io/audio/salamander/C4.mp3", // C4
  1: "https://tonejs.github.io/audio/salamander/Cs4.mp3", // C#4
  2: "https://tonejs.github.io/audio/salamander/D4.mp3", // D4
  3: "https://tonejs.github.io/audio/salamander/Ds4.mp3", // D#4
  4: "https://tonejs.github.io/audio/salamander/E4.mp3", // E4
  5: "https://tonejs.github.io/audio/salamander/F4.mp3", // F4
  6: "https://tonejs.github.io/audio/salamander/Fs4.mp3", // F#4
  7: "https://tonejs.github.io/audio/salamander/G4.mp3", // G4
  8: "https://tonejs.github.io/audio/salamander/Gs4.mp3", // G#4
  9: "https://tonejs.github.io/audio/salamander/A4.mp3", // A4
  10: "https://tonejs.github.io/audio/salamander/As4.mp3", // A#4
  11: "https://tonejs.github.io/audio/salamander/B4.mp3", // B4
} as const

export function usePianoSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const samplesRef = useRef<Map<number, AudioBuffer>>(new Map())
  const activeNotesRef = useRef<Map<number, AudioBufferSourceNode>>(new Map())
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Cargar samples de piano
  useEffect(() => {
    const loadSamples = async () => {
      try {
        // Crear contexto de audio compatible con React 19
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        const ctx = audioContextRef.current

        // Crear nodo de ganancia maestro
        gainNodeRef.current = ctx.createGain()
        gainNodeRef.current.gain.value = volume
        gainNodeRef.current.connect(ctx.destination)

        console.log("🎹 Loading piano samples...")

        const sampleEntries = Object.entries(PIANO_SAMPLES)
        let loadedCount = 0

        // Cargar cada sample
        for (const [keyIndex, url] of sampleEntries) {
          try {
            const response = await fetch(url)
            const arrayBuffer = await response.arrayBuffer()
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

            samplesRef.current.set(Number(keyIndex), audioBuffer)
            loadedCount++
            setLoadingProgress((loadedCount / sampleEntries.length) * 100)

            console.log(`✅ Loaded sample for key ${keyIndex}`)
          } catch (error) {
            console.warn(`⚠️ Failed to load sample for key ${keyIndex}:`, error)
          }
        }

        setIsLoaded(true)
        console.log(`🎹 Piano samples loaded successfully (${loadedCount}/${sampleEntries.length})`)
      } catch (error) {
        console.error("❌ Failed to load piano samples:", error)
        setIsLoaded(true) // Fallback a síntesis
      }
    }

    const handleUserInteraction = () => {
      loadSamples()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)

    // Intentar cargar inmediatamente
    loadSamples()

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)

      // Limpiar notas activas
      activeNotesRef.current.forEach((source) => {
        try {
          source.stop()
          source.disconnect()
        } catch (e) {
          // Ignorar errores
        }
      })
      activeNotesRef.current.clear()
    }
  }, [])

  // Actualizar volumen cuando cambia
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume
    }
  }, [volume])

  // Función para reproducir una nota usando samples
  const playNote = useCallback(
    (keyIndex: number) => {
      if (!audioContextRef.current || !isLoaded || !gainNodeRef.current) {
        console.warn("Audio context not ready")
        return
      }

      try {
        // Detener la nota si ya está sonando
        if (activeNotesRef.current.has(keyIndex)) {
          const existingSource = activeNotesRef.current.get(keyIndex)
          if (existingSource) {
            existingSource.stop()
            existingSource.disconnect()
            activeNotesRef.current.delete(keyIndex)
          }
        }

        const ctx = audioContextRef.current
        const normalizedIndex = keyIndex % 12
        const audioBuffer = samplesRef.current.get(normalizedIndex)

        if (audioBuffer) {
          // Usar sample real
          const source = ctx.createBufferSource()
          source.buffer = audioBuffer

          // Crear nodo de ganancia para esta nota
          const noteGain = ctx.createGain()
          noteGain.gain.setValueAtTime(0, ctx.currentTime)
          noteGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01)

          // Conectar source -> noteGain -> gainNode principal
          source.connect(noteGain)
          noteGain.connect(gainNodeRef.current)

          // Iniciar reproducción
          source.start()

          // Guardar referencia
          activeNotesRef.current.set(keyIndex, source)

          console.log(`🎵 Playing piano sample for key ${keyIndex}`)
        } else {
          // Fallback a síntesis si no hay sample
          console.warn(`No sample found for key ${keyIndex}, using synthesis`)
          playNoteSynthesis(keyIndex)
        }
      } catch (error) {
        console.error("Error playing note:", error)
        // Fallback a síntesis en caso de error
        playNoteSynthesis(keyIndex)
      }
    },
    [isLoaded],
  )

  // Función de fallback usando síntesis
  const playNoteSynthesis = useCallback((keyIndex: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    const frequencies = {
      0: 261.63,
      1: 277.18,
      2: 293.66,
      3: 311.13,
      4: 329.63,
      5: 349.23,
      6: 369.99,
      7: 392.0,
      8: 415.3,
      9: 440.0,
      10: 466.16,
      11: 493.88,
    } as const

    const ctx = audioContextRef.current
    const normalizedIndex = keyIndex % 12
    const frequency = frequencies[normalizedIndex as keyof typeof frequencies]

    if (!frequency) return

    const oscillator = ctx.createOscillator()
    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    const noteGain = ctx.createGain()
    noteGain.gain.setValueAtTime(0, ctx.currentTime)
    noteGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)

    oscillator.connect(noteGain)
    noteGain.connect(gainNodeRef.current)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 1)

    console.log(`🎵 Playing synthesized note at ${frequency}Hz (key ${keyIndex})`)
  }, [])

  // Función para detener una nota
  const stopNote = useCallback((keyIndex: number) => {
    const source = activeNotesRef.current.get(keyIndex)
    if (!source) return

    try {
      source.stop()
      source.disconnect()
      activeNotesRef.current.delete(keyIndex)
      console.log(`🎵 Stopped note (key ${keyIndex})`)
    } catch (error) {
      console.error("Error stopping note:", error)
    }
  }, [])

  // Función para reproducir una nota con duración específica
  const playNoteWithDuration = useCallback(
    (frequency: number, duration = 0.5) => {
      // Encontrar la nota más cercana a la frecuencia dada
      const frequencies = {
        0: 261.63,
        1: 277.18,
        2: 293.66,
        3: 311.13,
        4: 329.63,
        5: 349.23,
        6: 369.99,
        7: 392.0,
        8: 415.3,
        9: 440.0,
        10: 466.16,
        11: 493.88,
      } as const

      let closestNote = 0
      let minDiff = Number.POSITIVE_INFINITY

      Object.entries(frequencies).forEach(([index, freq]) => {
        const diff = Math.abs(freq - frequency)
        if (diff < minDiff) {
          minDiff = diff
          closestNote = Number.parseInt(index)
        }
      })

      const tempKeyIndex = 1000 + closestNote
      playNote(tempKeyIndex)
      setTimeout(() => stopNote(tempKeyIndex), duration * 1000)
    },
    [playNote, stopNote],
  )

  return {
    playNote,
    stopNote,
    playNoteWithDuration,
    setVolume,
    volume,
    isLoaded,
    loadingProgress,
  }
}

