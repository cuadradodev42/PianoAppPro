"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
// Importar los iconos necesarios
import { Volume2, Clock, Play, Pause, ClockIcon as Metronome } from "lucide-react"
import { Button } from "@/components/ui/button"

// Actualizar la interfaz para incluir metronome
interface RoomControlsProps {
  bpm: number
  volume: number
  isPlaying: boolean
  isMetronomeOn: boolean
  onBpmChange: (bpm: number) => void
  onVolumeChange: (volume: number) => void
  onToggleMetronome: () => void
  disabled?: boolean
}

// Actualizar la función para incluir los nuevos props
export default function RoomControls({
  bpm,
  volume,
  isPlaying,
  isMetronomeOn,
  onBpmChange,
  onVolumeChange,
  onToggleMetronome,
  disabled = false,
}: RoomControlsProps) {
  const handleBpmChange = (values: number[]) => {
    if (!disabled && values.length > 0) {
      console.log("🎵 BPM changed to:", values[0])
      onBpmChange(values[0])
    }
  }

  const handleVolumeChange = (values: number[]) => {
    if (!disabled && values.length > 0) {
      console.log("🔊 Volume changed to:", values[0])
      onVolumeChange(values[0])
    }
  }

  return (
    <Card className={`shadow-lg bg-white/80 backdrop-blur-sm ${disabled ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Controles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BPM Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Tempo</span>
            </div>
            <Badge variant="outline" className="font-mono">
              {bpm} BPM
            </Badge>
          </div>
          <Slider
            value={[bpm]}
            onValueChange={handleBpmChange}
            min={60}
            max={200}
            step={5}
            className="w-full"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>60</span>
            <span>200</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Volumen</span>
            </div>
            <Badge variant="outline">{Math.round(volume * 100)}%</Badge>
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Metronome Control */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Metronome className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Metrónomo</span>
            </div>
            <Button
              onClick={onToggleMetronome}
              disabled={disabled}
              variant={isMetronomeOn ? "default" : "outline"}
              size="sm"
              className="h-8"
            >
              {isMetronomeOn ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Detener
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Iniciar
                </>
              )}
            </Button>
          </div>

          {isMetronomeOn && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-purple-700">{bpm} BPM</span>
              </div>
            </div>
          )}
        </div>

        {/* Metronome Status */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Estado:</span>
            <div className="flex items-center space-x-2">
              {isPlaying ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-gray-400" />}
              <Badge variant={isPlaying ? "default" : "secondary"}>{isPlaying ? "Tocando" : "Silencio"}</Badge>
            </div>
          </div>
        </div>

        {disabled && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Los espectadores no pueden cambiar controles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
