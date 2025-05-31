"use client"

import { Badge } from "@/components/ui/badge"
import { WifiOff, AlertCircle, CheckCircle } from "lucide-react"

interface ConnectionStatusProps {
  isConnected: boolean
  error?: string | null
}

export default function ConnectionStatus({ isConnected, error }: ConnectionStatusProps) {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <Badge variant="destructive">Error</Badge>
        <span className="text-sm max-w-xs truncate">{error}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      {isConnected ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Badge variant="default" className="bg-green-600">
            Conectado
          </Badge>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <Badge variant="destructive">Desconectado</Badge>
        </>
      )}
    </div>
  )
}
