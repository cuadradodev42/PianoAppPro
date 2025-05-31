"use client"

import { useEffect, useRef, useCallback } from "react"

interface MetronomeOptions {
  bpm: number
  isPlaying: boolean
  volume: number
  onBeat?: (beatNumber: number) => void
}

export function useMetronome({ bpm, isPlaying, volume, onBeat }: MetronomeOptions) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const beatCountRef = useRef(0)

  // Inicializar contexto de audio
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      }
    }

    const handleUserInteraction = () => {
      initAudio()
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }

    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    initAudio()

    return () => {
      document.removeEventListener("click", handleUserInteraction)
    }
  }, [])

  // Función para reproducir el sonido del metrónomo
  const playTick = useCallback(
    (isAccent = false) => {
      if (!audioContextRef.current) return

      try {
        const ctx = audioContextRef.current

        // Reanudar contexto si está suspendido
        if (ctx.state === "suspended") {
          ctx.resume()
        }

        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        // Frecuencias diferentes para el acento y los beats normales
        oscillator.frequency.value = isAccent ? 800 : 600
        oscillator.type = "square"

        // Volumen ajustado
        const tickVolume = volume * 0.3
        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(tickVolume, ctx.currentTime + 0.001)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.1)

        console.log(`🎵 Metronome tick: ${isAccent ? "ACCENT" : "beat"}`)
      } catch (error) {
        console.error("Error playing metronome tick:", error)
      }
    },
    [volume],
  )

  // Controlar el metrónomo
  useEffect(() => {
    if (isPlaying) {
      beatCountRef.current = 0
      const interval = 60000 / bpm // Intervalo en milisegundos

      const tick = () => {
        beatCountRef.current += 1
        const isAccent = (beatCountRef.current - 1) % 4 === 0 // Acento cada 4 beats

        playTick(isAccent)
        onBeat?.(beatCountRef.current)
      }

      // Primer tick inmediato
      tick()

      // Configurar intervalo
      intervalRef.current = setInterval(tick, interval)

      console.log(`🎵 Metronome started at ${bpm} BPM`)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      beatCountRef.current = 0
      console.log("🎵 Metronome stopped")
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [bpm, isPlaying, playTick, onBeat])

  return {
    beatCount: beatCountRef.current,
  }
}
