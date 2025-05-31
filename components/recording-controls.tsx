"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Circle, Music, Clock, Users } from "lucide-react"
import { formatDuration, formatDate } from "@/lib/utils"
import type { Recording } from "@/app/room/[id]/page"

interface RecordingControlsProps {
  isRecording: boolean
  recordings: Recording[]
  onStartRecording: () => void
  onStopRecording: (name: string) => void
  onPlayRecording: (recordingId: string) => void
  disabled?: boolean
  isPlayingRecording?: boolean
}

export default function RecordingControls({
  isRecording,
  recordings,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
  disabled = false,
  isPlayingRecording = false,
}: RecordingControlsProps) {
  const [recordingName, setRecordingName] = useState("")

  const handleStopRecording = () => {
    const name = recordingName.trim() || `Grabación ${recordings.length + 1}`
    onStopRecording(name)
    setRecordingName("")
  }

  return (
    <Card className={`shadow-lg bg-white/80 backdrop-blur-sm ${disabled ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Music className="h-5 w-5" />
          <span>Grabaciones</span>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="h-3 w-3 mr-1 fill-current" />
              REC
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de Grabación */}
        <div className="space-y-3">
          {!isRecording ? (
            <Button onClick={onStartRecording} disabled={disabled} className="w-full" variant="destructive">
              <Circle className="h-4 w-4 mr-2" />
              Iniciar Grabación
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Nombre de la grabación"
                value={recordingName}
                onChange={(e) => setRecordingName(e.target.value)}
                maxLength={50}
              />
              <Button onClick={handleStopRecording} className="w-full" variant="outline">
                <Square className="h-4 w-4 mr-2" />
                Detener Grabación
              </Button>
            </div>
          )}
        </div>

        {/* Lista de Grabaciones */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700">Grabaciones Guardadas ({recordings.length})</h4>

          {recordings.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No hay grabaciones aún</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recordings.map((recording) => (
                <div key={recording.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm truncate">{recording.name}</h5>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPlayRecording(recording.id)}
                      disabled={disabled || isPlayingRecording}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(recording.duration)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{recording.playerCount}</span>
                      </span>
                    </div>
                    <span>{formatDate(recording.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {disabled && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Los espectadores no pueden grabar</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
