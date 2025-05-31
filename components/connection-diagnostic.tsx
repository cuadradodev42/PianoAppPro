"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function ConnectionDiagnostic() {
  const [backendUrl, setBackendUrl] = useState<string>("")
  const [healthStatus, setHealthStatus] = useState<string>("Verificando...")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    setIsLoading(true)
    setError(null)
    setHealthStatus("Verificando...")

    try {
      // Obtener la URL del backend
      const url = process.env.NEXT_PUBLIC_BACKEND_URL || "https://pianopartybackend.onrender.com"
      setBackendUrl(url)

      // Verificar el endpoint de health
      const healthResponse = await fetch(`${url}/health`, {
        mode: "cors",
        headers: {
          Accept: "application/json",
        },
      })

      if (healthResponse.ok) {
        const data = await healthResponse.json()
        setHealthStatus(`Conectado: ${data.message || "OK"}`)
      } else {
        setHealthStatus(`Error: ${healthResponse.status} ${healthResponse.statusText}`)
        setError("El backend respondió con un error")
      }
    } catch (err: any) {
      console.error("Error checking connection:", err)
      setHealthStatus("Error de conexión")
      setError(err.message || "No se pudo conectar al backend")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Diagnóstico de Conexión</span>
          <Button variant="ghost" size="sm" onClick={checkConnection} disabled={isLoading} className="h-8 w-8 p-0">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Backend URL:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {backendUrl || "No configurada"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className={`text-sm ${error ? "text-red-500" : ""}`}>{healthStatus}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Verifica que el backend esté ejecutándose y que la URL sea correcta.
            </p>
          </div>
        )}

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            Si ves "Conectado", el backend está funcionando correctamente. Si ves un error, verifica que el backend esté
            ejecutándose en Render y que la URL configurada sea correcta.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
