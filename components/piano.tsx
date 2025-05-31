"use client"

import { useState, useRef, useMemo, memo } from "react"
import { Card } from "@/components/ui/card"
import { usePianoSound } from "@/hooks/use-piano-sound"
import { isKeyInScale } from "@/constants"
import type { RoomState } from "@/app/room/[id]/page"
import { useResizeObserver } from "@/hooks/use-resize-observer"

interface PianoProps {
  roomState: RoomState
  myKeyIndex: number
  onKeyPress: (keyIndex: number) => void
  isSpectator?: boolean
  selectedScale: string
}

// Definición de una octava estándar
const OCTAVE_KEYS = [
  { note: "C", type: "white", index: 0, label: "Do" },
  { note: "C#", type: "black", index: 1, label: "Do#" },
  { note: "D", type: "white", index: 2, label: "Re" },
  { note: "D#", type: "black", index: 3, label: "Re#" },
  { note: "E", type: "white", index: 4, label: "Mi" },
  { note: "F", type: "white", index: 5, label: "Fa" },
  { note: "F#", type: "black", index: 6, label: "Fa#" },
  { note: "G", type: "white", index: 7, label: "Sol" },
  { note: "G#", type: "black", index: 8, label: "Sol#" },
  { note: "A", type: "white", index: 9, label: "La" },
  { note: "A#", type: "black", index: 10, label: "La#" },
  { note: "B", type: "white", index: 11, label: "Si" },
]

// Posiciones relativas de las teclas negras (en porcentaje del ancho de una tecla blanca)
const BLACK_KEY_POSITIONS = {
  "C#": 0.75,
  "D#": 1.75,
  "F#": 3.75,
  "G#": 4.75,
  "A#": 5.75,
}

const Piano = memo(function Piano({
  roomState,
  myKeyIndex,
  onKeyPress,
  isSpectator = false,
  selectedScale,
}: PianoProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set())
  const { playNote, stopNote, isLoaded } = usePianoSound()
  const pianoContainerRef = useRef<HTMLDivElement>(null)
  const { width: containerWidth } = useResizeObserver(pianoContainerRef)

  // Separar teclas blancas y negras
  const whiteKeys = useMemo(() => OCTAVE_KEYS.filter((key) => key.type === "white"), [])
  const blackKeys = useMemo(() => OCTAVE_KEYS.filter((key) => key.type === "black"), [])

  // Calcular dimensiones responsivas
  const whiteKeyWidth = useMemo(() => {
    if (!containerWidth) return 60
    // Asegurar que las teclas tengan un tamaño mínimo en móviles
    return Math.max(45, Math.min(80, containerWidth / whiteKeys.length))
  }, [containerWidth, whiteKeys.length])

  const whiteKeyHeight = useMemo(() => whiteKeyWidth * 4, [whiteKeyWidth])
  const blackKeyWidth = useMemo(() => whiteKeyWidth * 0.65, [whiteKeyWidth])
  const blackKeyHeight = useMemo(() => whiteKeyHeight * 0.6, [whiteKeyHeight])

  const handleKeyDown = (keyIndex: number) => {
    if (isSpectator || keyIndex !== myKeyIndex || pressedKeys.has(keyIndex)) return

    setPressedKeys((prev) => new Set(prev).add(keyIndex))
    playNote(keyIndex)
    onKeyPress(keyIndex)
  }

  const handleKeyUp = (keyIndex: number) => {
    if (!pressedKeys.has(keyIndex)) return

    setPressedKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(keyIndex)
      return newSet
    })
    stopNote(keyIndex)
  }

  const getKeyColor = (keyIndex: number, keyType: string) => {
    const isMyKey = keyIndex === myKeyIndex && !isSpectator
    const isPressed = pressedKeys.has(keyIndex)
    const assignedPlayer = roomState.players.find((p) => p.keyIndex === keyIndex && !p.isSpectator)
    const inScale = isKeyInScale(keyIndex, selectedScale as any)

    if (keyType === "white") {
      if (isPressed) return "bg-gradient-to-b from-purple-300 to-purple-500 shadow-lg transform scale-95"
      if (isMyKey) return "bg-gradient-to-b from-blue-100 to-blue-200 border-blue-400 shadow-md"
      if (assignedPlayer) return "bg-gradient-to-b from-green-100 to-green-200 border-green-300"
      if (inScale) return "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100"
      return "bg-gradient-to-b from-gray-100 to-gray-200 border-gray-300 opacity-60"
    } else {
      if (isPressed) return "bg-gradient-to-b from-purple-600 to-purple-800 shadow-lg transform scale-95"
      if (isMyKey) return "bg-gradient-to-b from-blue-600 to-blue-800 border-blue-700"
      if (assignedPlayer) return "bg-gradient-to-b from-green-600 to-green-800 border-green-700"
      if (inScale) return "bg-gradient-to-b from-gray-800 to-black border-gray-900"
      return "bg-gradient-to-b from-gray-600 to-gray-800 border-gray-700 opacity-60"
    }
  }

  const getKeyTextColor = (keyIndex: number, keyType: string) => {
    const isMyKey = keyIndex === myKeyIndex && !isSpectator
    const isPressed = pressedKeys.has(keyIndex)
    const assignedPlayer = roomState.players.find((p) => p.keyIndex === keyIndex && !p.isSpectator)

    if (keyType === "white") {
      if (isPressed) return "text-white font-bold"
      if (isMyKey) return "text-blue-700 font-semibold"
      if (assignedPlayer) return "text-green-700 font-semibold"
      return "text-gray-600"
    } else {
      return "text-white"
    }
  }

  const activePlayers = roomState.players.filter((p) => !p.isSpectator)

  return (
    <Card className="p-3 sm:p-4 lg:p-6 shadow-xl bg-gradient-to-br from-white to-gray-50">
      <div className="relative">
        {/* Título */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Piano Colaborativo
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
            <p className="text-xs sm:text-sm text-gray-600">
              {activePlayers.length} jugador{activePlayers.length !== 1 ? "es" : ""} activo
              {activePlayers.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-purple-600 font-medium">Escala: {selectedScale}</span>
              {roomState.isRecording && (
                <span className="text-xs sm:text-sm text-red-600 font-semibold animate-pulse">🔴 GRABANDO</span>
              )}
            </div>
          </div>
          {!isLoaded && (
            <div className="mt-2 text-amber-600 text-sm bg-amber-50 p-2 rounded-lg">⚠️ Cargando sonidos de piano...</div>
          )}
        </div>

        {/* Piano */}
        <div className="relative mx-auto overflow-hidden" ref={pianoContainerRef}>
          <div className="flex justify-center relative" style={{ height: `${whiteKeyHeight}px` }}>
            {/* Contenedor principal - asegura que el piano esté centrado */}
            <div
              className="relative"
              style={{ width: `${whiteKeyWidth * whiteKeys.length}px`, height: `${whiteKeyHeight}px` }}
            >
              {/* Teclas blancas */}
              <div className="flex absolute inset-0">
                {whiteKeys.map((key) => {
                  const keyIndex = key.index
                  const assignedPlayer = roomState.players.find((p) => p.keyIndex === keyIndex && !p.isSpectator)
                  const canPlay = !isSpectator && keyIndex === myKeyIndex
                  const inScale = isKeyInScale(keyIndex, selectedScale as any)

                  return (
                    <button
                      key={`white-${keyIndex}`}
                      className={`
                        relative transition-all duration-150 select-none rounded-b-lg
                        border-2 ${getKeyColor(keyIndex, "white")}
                        ${canPlay ? "cursor-pointer active:scale-95" : "cursor-default"}
                        ${isSpectator ? "opacity-75" : ""}
                      `}
                      style={{
                        width: `${whiteKeyWidth}px`,
                        height: "100%",
                        marginLeft: key.note !== "C" ? "-1px" : "0", // Solapamiento de bordes
                      }}
                      onMouseDown={() => canPlay && handleKeyDown(keyIndex)}
                      onMouseUp={() => canPlay && handleKeyUp(keyIndex)}
                      onMouseLeave={() => canPlay && handleKeyUp(keyIndex)}
                      onTouchStart={(e) => {
                        if (canPlay) {
                          e.preventDefault()
                          handleKeyDown(keyIndex)
                        }
                      }}
                      onTouchEnd={(e) => {
                        if (canPlay) {
                          e.preventDefault()
                          handleKeyUp(keyIndex)
                        }
                      }}
                      disabled={!canPlay}
                      aria-pressed={pressedKeys.has(keyIndex)}
                      aria-label={`Tecla ${key.label}`}
                    >
                      {/* Nota musical */}
                      <div
                        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${getKeyTextColor(keyIndex, "white")}`}
                      >
                        {key.label}
                      </div>

                      {/* Nombre del jugador */}
                      {assignedPlayer && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center w-full px-1">
                          <div className="bg-white bg-opacity-80 rounded px-1 py-0.5 truncate">
                            {assignedPlayer.name.slice(0, 8)}
                          </div>
                        </div>
                      )}

                      {/* Indicador de escala */}
                      {inScale && (
                        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Teclas negras - posicionadas absolutamente sobre las blancas */}
              {blackKeys.map((key) => {
                const keyIndex = key.index
                const assignedPlayer = roomState.players.find((p) => p.keyIndex === keyIndex && !p.isSpectator)
                const canPlay = !isSpectator && keyIndex === myKeyIndex
                const inScale = isKeyInScale(keyIndex, selectedScale as any)

                // Calcular posición basada en el mapa de posiciones
                const position = BLACK_KEY_POSITIONS[key.note as keyof typeof BLACK_KEY_POSITIONS] * whiteKeyWidth

                return (
                  <button
                    key={`black-${keyIndex}`}
                    className={`
                      absolute top-0 border-2 transition-all duration-150 select-none z-10 rounded-b-md
                      ${getKeyColor(keyIndex, "black")}
                      ${canPlay ? "cursor-pointer active:scale-95" : "cursor-default"}
                      ${isSpectator ? "opacity-75" : ""}
                    `}
                    style={{
                      width: `${blackKeyWidth}px`,
                      height: `${blackKeyHeight}px`,
                      left: `${position - blackKeyWidth / 2}px`,
                    }}
                    onMouseDown={() => canPlay && handleKeyDown(keyIndex)}
                    onMouseUp={() => canPlay && handleKeyUp(keyIndex)}
                    onMouseLeave={() => canPlay && handleKeyUp(keyIndex)}
                    onTouchStart={(e) => {
                      if (canPlay) {
                        e.preventDefault()
                        handleKeyDown(keyIndex)
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (canPlay) {
                        e.preventDefault()
                        handleKeyUp(keyIndex)
                      }
                    }}
                    disabled={!canPlay}
                    aria-pressed={pressedKeys.has(keyIndex)}
                    aria-label={`Tecla ${key.label}`}
                  >
                    {/* Nota musical */}
                    <div
                      className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium ${getKeyTextColor(keyIndex, "black")}`}
                    >
                      {key.label}
                    </div>

                    {/* Nombre del jugador */}
                    {assignedPlayer && (
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-medium text-white text-center w-full px-1 truncate">
                        {assignedPlayer.name.slice(0, 4)}
                      </div>
                    )}

                    {/* Indicador de escala */}
                    {inScale && (
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
          {!isSpectator && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-b from-blue-100 to-blue-200 border border-blue-400 rounded"></div>
              <span>Tu tecla</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-b from-green-100 to-green-200 border border-green-300 rounded"></div>
            <span>Tecla asignada</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>En escala actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded opacity-60"></div>
            <span>Fuera de escala</span>
          </div>
        </div>
      </div>
    </Card>
  )
})

export default Piano
