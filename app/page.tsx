"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Wifi, Eye, Piano, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [joinAsSpectator, setJoinAsSpectator] = useState(false)
  const router = useRouter()

  const createRoom = async () => {
    if (!playerName.trim()) {
      alert("Por favor ingresa tu nombre")
      return
    }

    setIsCreating(true)
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Simular creación de sala
    setTimeout(() => {
      router.push(`/room/${newRoomCode}?name=${encodeURIComponent(playerName)}&spectator=false`)
    }, 500)
  }

  const joinRoom = () => {
    if (!roomCode.trim()) {
      alert("Por favor ingresa el código de sala")
      return
    }
    if (!playerName.trim()) {
      alert("Por favor ingresa tu nombre")
      return
    }
    router.push(`/room/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName)}&spectator=${joinAsSpectator}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Piano className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Piano Party
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-xs sm:max-w-sm mx-auto">
            Toca música en tiempo real con tus amigos desde cualquier dispositivo
          </p>
        </div>

        {/* Player Configuration */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Configuración del Jugador</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Ingresa tu nombre para comenzar a tocar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Input
              placeholder="Tu nombre"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {/* Create Room */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Crear Nueva Sala</CardTitle>
              <CardDescription className="text-purple-100 text-xs sm:text-sm">
                Inicia una nueva sesión musical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createRoom}
                disabled={!playerName.trim() || isCreating}
                className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold h-10 sm:h-11 text-sm sm:text-base"
                size="lg"
              >
                {isCreating ? "Creando..." : "Crear Sala"}
              </Button>
            </CardContent>
          </Card>

          {/* Join Room */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Unirse a Sala</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Ingresa el código de una sala existente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Código de sala (ej: ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-sm sm:text-base h-10 sm:h-11 font-mono"
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spectator"
                  checked={joinAsSpectator}
                  onCheckedChange={(checked) => setJoinAsSpectator(checked as boolean)}
                />
                <label
                  htmlFor="spectator"
                  className="text-xs sm:text-sm text-gray-600 flex items-center space-x-1 cursor-pointer"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Unirse como espectador (solo escuchar)</span>
                </label>
              </div>

              <Button
                onClick={joinRoom}
                disabled={!roomCode.trim() || !playerName.trim()}
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                variant="outline"
                size="lg"
              >
                <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                {joinAsSpectator ? "Unirse como Espectador" : "Unirse"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="text-center text-xs sm:text-sm text-gray-500 space-y-1 bg-white/50 rounded-lg p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center justify-center space-x-1">
              <span>🎵</span>
              <span>Piano colaborativo</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span>🎹</span>
              <span>Escalas musicales</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span>🎬</span>
              <span>Grabación de sesiones</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <span>👁️</span>
              <span>Modo espectador</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Comparte el código de sala con tus amigos para que se unan</p>
        </div>
      </div>
    </div>
  )
}
