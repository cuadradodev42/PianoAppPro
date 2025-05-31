"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Eye } from "lucide-react"
import type { Player } from "@/app/room/[id]/page"

interface PlayerListProps {
  players: Player[]
  myKeyIndex: number
  isSpectator?: boolean
}

export default function PlayerList({ players, myKeyIndex, isSpectator = false }: PlayerListProps) {
  const activePlayers = players.filter((p) => !p.isSpectator)
  const spectators = players.filter((p) => p.isSpectator)

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Users className="h-5 w-5" />
          <span>Participantes ({players.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
        {/* Jugadores Activos */}
        {activePlayers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Jugadores ({activePlayers.length})</span>
            </h4>
            {activePlayers.map((player) => (
              <div
                key={player.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${player.keyIndex === myKeyIndex && !isSpectator ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${player.keyIndex === myKeyIndex && !isSpectator ? "bg-blue-500 text-white" : "bg-gray-400 text-white"}
                  `}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {player.name}
                      {player.keyIndex === myKeyIndex && !isSpectator && (
                        <span className="text-blue-600 ml-1">(Tú)</span>
                      )}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`
                        w-2 h-2 rounded-full
                        ${player.isConnected ? "bg-green-500" : "bg-red-500"}
                      `}
                      />
                      <span className="text-xs text-gray-500">{player.isConnected ? "Conectado" : "Desconectado"}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono">
                  Tecla {player.keyIndex + 1}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Espectadores */}
        {spectators.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>Espectadores ({spectators.length})</span>
            </h4>
            {spectators.map((spectator) => (
              <div
                key={spectator.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg border
                  ${isSpectator && spectator.id === players.find((p) => p.id === spectator.id)?.id ? "bg-purple-50 border-purple-200" : "bg-gray-50 border-gray-200"}
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-400 text-white">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {spectator.name}
                      {isSpectator && spectator.id === players.find((p) => p.id === spectator.id)?.id && (
                        <span className="text-purple-600 ml-1">(Tú)</span>
                      )}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`
                        w-2 h-2 rounded-full
                        ${spectator.isConnected ? "bg-green-500" : "bg-red-500"}
                      `}
                      />
                      <span className="text-xs text-gray-500">
                        {spectator.isConnected ? "Conectado" : "Desconectado"}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Espectador</span>
                </Badge>
              </div>
            ))}
          </div>
        )}

        {players.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No hay participantes conectados</p>
        )}
      </CardContent>
    </Card>
  )
}
