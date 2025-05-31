"use client"

import { useEffect, useRef, useState } from "react"

export function useAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [volume, setVolume] = useState(0.7)
  const [isInitialized, setIsInitialized] = useState(false)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)
  const activeNotesRef = useRef<
    Map<number, { oscillators: OscillatorNode[]; gainNodes: GainNode[]; masterGain: GainNode }>
  >(new Map())

  useEffect(() => {
    const initAudio = async () => {
      if (!audioContextRef.current) {
        try {
          // React 19 compatible - usar constructor directo
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

          // Crear compresor suave
          compressorRef.current = audioContextRef.current.createDynamicsCompressor()
          compressorRef.current.threshold.value = -20
          compressorRef.current.knee.value = 20
          compressorRef.current.ratio.value = 4
          compressorRef.current.attack.value = 0.003
          compressorRef.current.release.value = 0.1
          compressorRef.current.connect(audioContextRef.current.destination)

          // Reanudar el contexto si está suspendido
          if (audioContextRef.current.state === "suspended") {
            await audioContextRef.current.resume()
          }

          console.log("🎵 Audio context initialized successfully")
          setIsInitialized(true)
        } catch (error) {
          console.error("❌ Failed to initialize audio context:", error)
        }
      }
    }

    const handleFirstInteraction = async () => {
      await initAudio()
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("touchstart", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("touchstart", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [])

  const startNote = async (frequency: number, keyIndex: number) => {
    if (!audioContextRef.current) {
      console.warn("⚠️ Audio context not initialized")
      return
    }

    // Si la nota ya está sonando, no hacer nada
    if (activeNotesRef.current.has(keyIndex)) {
      return
    }

    try {
      const ctx = audioContextRef.current

      // Reanudar contexto si está suspendido
      if (ctx.state === "suspended") {
        await ctx.resume()
      }

      // Crear osciladores más simples y naturales
      const oscillators: OscillatorNode[] = []
      const gainNodes: GainNode[] = []

      // Nodo de ganancia principal
      const masterGain = ctx.createGain()
      masterGain.gain.value = 0

      // 1. Fundamental - Onda senoidal pura
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(frequency, ctx.currentTime)

      // 2. Segundo armónico (octava) - Más suave
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime)

      // 3. Tercer armónico (quinta) - Muy suave
      const osc3 = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.type = "triangle"
      osc3.frequency.setValueAtTime(frequency * 3, ctx.currentTime)

      // 4. Componente de ataque percusivo
      const attackOsc = ctx.createOscillator()
      const attackGain = ctx.createGain()
      attackOsc.type = "square"
      attackOsc.frequency.setValueAtTime(frequency * 8, ctx.currentTime)

      oscillators.push(osc1, osc2, osc3, attackOsc)
      gainNodes.push(gain1, gain2, gain3, attackGain)

      // Volúmenes más naturales
      const baseVolume = volume * 0.2
      const volumes = [
        baseVolume, // Fundamental (100%)
        baseVolume * 0.3, // Octava (30%)
        baseVolume * 0.1, // Quinta (10%)
        baseVolume * 0.05, // Ataque percusivo (5%)
      ]

      // Envelope más natural
      const attackTime = 0.002 // 2ms - Ataque muy rápido
      const decayTime = 0.1 // 100ms - Decay natural
      const sustainLevel = 0.6 // 60% del volumen máximo

      gainNodes.forEach((gain, index) => {
        gain.gain.setValueAtTime(0, ctx.currentTime)

        if (index === 3) {
          // Ataque percusivo - muy corto
          gain.gain.linearRampToValueAtTime(volumes[index], ctx.currentTime + 0.001)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01)
        } else {
          // Attack normal
          gain.gain.linearRampToValueAtTime(volumes[index], ctx.currentTime + attackTime)
          // Decay al sustain
          gain.gain.setTargetAtTime(volumes[index] * sustainLevel, ctx.currentTime + attackTime, decayTime / 3)
        }
      })

      // Filtro suave para naturalidad
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = Math.min(8000, frequency * 4)
      filter.Q.value = 0.5

      // Conectar osciladores
      oscillators.forEach((osc, index) => {
        osc.connect(gainNodes[index])
        gainNodes[index].connect(filter)
      })

      filter.connect(masterGain)
      masterGain.connect(compressorRef.current || ctx.destination)

      // Iniciar osciladores
      const startTime = ctx.currentTime
      oscillators.forEach((osc) => {
        osc.start(startTime)
      })

      // Fade in del volumen principal
      masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + attackTime)

      // Guardar la nota activa
      activeNotesRef.current.set(keyIndex, {
        oscillators,
        gainNodes,
        masterGain,
      })

      console.log(`🎵 Started natural note at ${frequency}Hz (key ${keyIndex})`)
    } catch (error) {
      console.error("❌ Error starting note:", error)
    }
  }

  const stopNote = (keyIndex: number) => {
    const activeNote = activeNotesRef.current.get(keyIndex)
    if (!activeNote) return

    try {
      const ctx = audioContextRef.current
      if (!ctx) return

      const { oscillators, gainNodes, masterGain } = activeNote
      const releaseTime = 0.08 // 80ms - Release natural

      // Release suave
      masterGain.gain.setTargetAtTime(0.001, ctx.currentTime, releaseTime / 3)

      gainNodes.forEach((gain) => {
        gain.gain.setTargetAtTime(0.001, ctx.currentTime, releaseTime / 3)
      })

      // Detener y limpiar después del release
      setTimeout(() => {
        oscillators.forEach((osc) => {
          try {
            osc.stop()
            osc.disconnect()
          } catch (e) {
            // Ignorar errores si ya está desconectado
          }
        })
        gainNodes.forEach((gain) => gain.disconnect())
        masterGain.disconnect()
        activeNotesRef.current.delete(keyIndex)
      }, releaseTime * 1000)

      console.log(`🎵 Stopped note (key ${keyIndex})`)
    } catch (error) {
      console.error("❌ Error stopping note:", error)
    }
  }

  // Función legacy para compatibilidad
  const playNote = async (frequency: number, duration = 0.5) => {
    const tempKeyIndex = Math.random() * 1000
    await startNote(frequency, tempKeyIndex)
    setTimeout(() => stopNote(tempKeyIndex), duration * 1000)
  }

  return {
    startNote,
    stopNote,
    playNote,
    setVolume,
    volume,
    isInitialized,
  }
}
