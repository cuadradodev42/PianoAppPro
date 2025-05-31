"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Piano from "@/components/piano"
import PlayerList from "@/components/player-list"
import RoomControls from "@/components/room-controls"
import RecordingControls from "@/components/recording-controls"
import ScaleSelector from "@/components/scale-selector"
import { useWebSocket } from "@/hooks/use-websocket"
import { usePianoSound } from "@/hooks/use-piano-sound"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Copy, Check, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConnectionStatus from "@/components/connection-status"
import Link from "next/link"
// Importar el hook del metrónomo:
import { useMetronome } from "@/hooks/use-metronome"

export interface Player {
  id: string
  name: string
  keyIndex: number
  isConnected: boolean
  isSpectator: boolean
}

export interface Recording {
  id: string
  name: string
  duration: number
  createdAt: number
  playerCount: number
}

export interface RoomState {
  id: string
  players: Player[]
  isPlaying: boolean
  bpm: number
  volume: number
  isRecording: boolean
  recordings: Recording[]
  selectedScale?: string
  isMetronomeOn?: boolean
}

interface PageProps {
  params: { id: string }
}

export default function RoomPage({ params }: PageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = params.id

  // Validar parámetros requeridos - memoizados para evitar cambios
  const playerName = useMemo(() => searchParams.get("name"), [searchParams])
  const isSpectator = useMemo(() => searchParams.get("spectator") === "true", [searchParams])

  // Estados principales
  const [roomState, setRoomState] = useState<RoomState>({
    id: roomId,
    players: [],
    isPlaying: false,
    bpm: 120,
    volume: 0.7,
    isRecording: false,
    recordings: [],
    selectedScale: "C Major",
    isMetronomeOn: false,
  })

  const [myKeyIndex, setMyKeyIndex] = useState<number>(-1)
  const [copied, setCopied] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [selectedScale, setSelectedScale] = useState("C Major")
  const [beatCount, setBeatCount] = useState(0)

  const { playNoteWithDuration, setVolume } = usePianoSound()

  const { beatCount: metronomeBeatCount } = useMetronome({
    bpm: roomState.bpm,
    isPlaying: roomState.isMetronomeOn || false,
    volume: roomState.volume,
    onBeat: setBeatCount,
  })

  // Redirigir a home si faltan parámetros - solo una vez
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!playerName) {
      console.warn("No player name provided, redirecting to home")
      setShouldRedirect(true)
    }
  }, [playerName])

  useEffect(() => {
    if (shouldRedirect) {
      router.push("/")
    }
  }, [shouldRedirect, router])

  // No renderizar si no hay nombre de jugador
  if (shouldRedirect) {
    return null
  }

  // Sincronizar escala local con la del servidor - evitar loops
  useEffect(() => {
    if (roomState.selectedScale && roomState.selectedScale !== selectedScale) {
      console.log("🎵 Syncing scale:", roomState.selectedScale)
      setSelectedScale(roomState.selectedScale)
    }
  }, [roomState.selectedScale]) // Removido selectedScale de dependencias

  // Sincronizar volumen con el estado de la sala
  useEffect(() => {
    setVolume(roomState.volume)
  }, [roomState.volume, setVolume])

  // Callbacks memoizados para evitar recreaciones
  const playRecording = useCallback(
    (recording: any) => {
      if (isPlayingRecording) return

      setIsPlayingRecording(true)
      console.log("🎬 Playing recording:", recording.name)

      // Reproducir eventos en orden cronológico
      recording.events.forEach((event: any) => {
        setTimeout(() => {
          if (event.type === "keyPress") {
            playNoteWithDuration(event.frequency, 0.8)
          }
        }, event.relativeTime)
      })

      // Marcar como terminado
      setTimeout(() => {
        setIsPlayingRecording(false)
      }, recording.duration + 1000)
    },
    [isPlayingRecording, playNoteWithDuration],
  )

  // Handlers memoizados para WebSocket
  const websocketHandlers = useMemo(
    () => ({
      onRoomUpdate: (data: any) => {
        console.log("🔄 Room update received")
        setRoomState(data.room)
        if (data.myKeyIndex !== undefined) {
          console.log("🎹 My key index set to:", data.myKeyIndex)
          setMyKeyIndex(data.myKeyIndex)
        }
      },
      onKeyPress: (data: any) => {
        console.log("🎹 Key press received")
        playNoteWithDuration(data.frequency, 0.8)
      },
      onRecordingPlayback: (data: any) => {
        playRecording(data.recording)
      },
      onError: (errorMessage: string) => {
        console.error("WebSocket error:", errorMessage)
      },
    }),
    [playNoteWithDuration, playRecording],
  )

  const { sendMessage, isConnected, error } = useWebSocket(
    roomId,
    playerName || "Jugador",
    isSpectator,
    websocketHandlers,
  )

  // Handlers de UI memoizados
  const copyRoomCode = useCallback(async () => {
    await navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomId])

  const handleKeyPress = useCallback(
    (keyIndex: number) => {
      console.log(`🎹 Attempting to press key ${keyIndex}`)

      if (keyIndex === myKeyIndex && !isSpectator) {
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
        }

        const normalizedIndex = keyIndex % 12
        const frequency = frequencies[normalizedIndex as keyof typeof frequencies] || 440

        sendMessage({
          type: "keyPress",
          keyIndex,
          frequency,
        })
      }
    },
    [myKeyIndex, isSpectator, sendMessage],
  )

  const handleBpmChange = useCallback(
    (bpm: number) => {
      sendMessage({ type: "updateBpm", bpm })
    },
    [sendMessage],
  )

  const handleVolumeChange = useCallback(
    (volume: number) => {
      sendMessage({ type: "updateVolume", volume })
    },
    [sendMessage],
  )

  const handleScaleChange = useCallback(
    (scale: string) => {
      console.log("🎵 Changing scale to:", scale)
      setSelectedScale(scale)
      sendMessage({ type: "updateScale", selectedScale: scale })
    },
    [sendMessage],
  )

  const handleToggleMetronome = useCallback(() => {
    sendMessage({ type: "toggleMetronome" })
  }, [sendMessage])

  const handleStartRecording = useCallback(() => {
    sendMessage({ type: "startRecording" })
  }, [sendMessage])

  const handleStopRecording = useCallback(
    (recordingName: string) => {
      sendMessage({ type: "stopRecording", recordingName })
    },
    [sendMessage],
  )

  const handlePlayRecording = useCallback(
    (recordingId: string) => {
      sendMessage({ type: "playRecording", recordingId })
    },
    [sendMessage],
  )

  // Memoizar cálculos costosos
  const activePlayers = useMemo(() => roomState.players.filter((p) => !p.isSpectator), [roomState.players])
  const spectators = useMemo(() => roomState.players.filter((p) => p.isSpectator), [roomState.players])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Music className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <div>
                  <CardTitle className="text-lg sm:text-xl flex items-center space-x-2">
                    <span>Piano Party</span>
                    {isSpectator && (
                      <Badge variant="secondary" className="flex items-center space-x-1 text-xs">
                        <Eye className="h-3 w-3" />
                        <span>Espectador</span>
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-gray-600">Sala:</span>
                      <Badge variant="outline" className="font-mono text-xs sm:text-sm">
                        {roomId}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={copyRoomCode} className="h-6 w-6 p-0">
                        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Jugador: <span className="font-medium">{playerName}</span>
                    </div>
                  </div>
                </div>
              </div>
              <ConnectionStatus isConnected={isConnected} error={error} />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="text-red-700 text-sm">⚠️ {error}</p>
              </div>
            )}
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Piano */}
          <div className="xl:col-span-3">
            <Piano
              roomState={roomState}
              myKeyIndex={myKeyIndex}
              onKeyPress={handleKeyPress}
              isSpectator={isSpectator}
              selectedScale={selectedScale}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PlayerList players={roomState.players} myKeyIndex={myKeyIndex} isSpectator={isSpectator} />

            <ScaleSelector selectedScale={selectedScale} onScaleChange={handleScaleChange} disabled={isSpectator} />

            <RoomControls
              bpm={roomState.bpm}
              volume={roomState.volume}
              isPlaying={roomState.isPlaying}
              isMetronomeOn={roomState.isMetronomeOn || false}
              onBpmChange={handleBpmChange}
              onVolumeChange={handleVolumeChange}
              onToggleMetronome={handleToggleMetronome}
              disabled={isSpectator}
            />

            <RecordingControls
              isRecording={roomState.isRecording}
              recordings={roomState.recordings}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onPlayRecording={handlePlayRecording}
              disabled={isSpectator}
              isPlayingRecording={isPlayingRecording}
            />
          </div>
        </div>

        {/* Instrucciones */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center space-y-2">
              {isSpectator ? (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-purple-600">Modo Espectador</span> • Puedes escuchar pero no tocar
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {myKeyIndex >= 0 ? (
                    <>
                      <span className="font-semibold text-purple-600">Tu tecla asignada: {myKeyIndex + 1}</span> • Solo
                      puedes tocar tu tecla asignada
                    </>
                  ) : (
                    "Esperando asignación de tecla..."
                  )}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs text-gray-500">
                <span>👥 {activePlayers.length} jugadores activos</span>
                {spectators.length > 0 && <span>👁️ {spectators.length} espectadores</span>}
                <span>🎬 {roomState.recordings.length} grabaciones</span>
                <span>🎵 Escala: {selectedScale}</span>
              </div>
              <p className="text-xs text-gray-500">Comparte el código de sala con tus amigos para que se unan</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
