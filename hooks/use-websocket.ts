"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface WebSocketHooks {
  onRoomUpdate?: (data: any) => void
  onKeyPress?: (data: any) => void
  onRecordingPlayback?: (data: any) => void
  onError?: (error: string) => void
}

export function useWebSocket(roomId: string, playerName: string, asSpectator: boolean, hooks: WebSocketHooks) {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<any>(null)
  const hasJoinedRoom = useRef(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const isConnecting = useRef(false)

  // Memoizar los hooks para evitar recreaciones
  const stableHooks = useMemo(
    () => hooks,
    [
      hooks.onRoomUpdate?.toString(),
      hooks.onKeyPress?.toString(),
      hooks.onRecordingPlayback?.toString(),
      hooks.onError?.toString(),
    ],
  )

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (socketRef.current?.connected) {
        console.log(`📤 Sending message: ${message.type}`)

        switch (message.type) {
          case "keyPress":
            socketRef.current.emit("key-press", {
              roomId,
              keyIndex: message.keyIndex,
              frequency: message.frequency || 440,
            })
            break
          case "updateBpm":
            socketRef.current.emit("update-bpm", {
              roomId,
              bpm: message.bpm,
            })
            break
          case "updateVolume":
            socketRef.current.emit("update-volume", {
              roomId,
              volume: message.volume,
            })
            break
          case "updateScale":
            socketRef.current.emit("update-scale", {
              roomId,
              selectedScale: message.selectedScale,
            })
            break
          case "startRecording":
            socketRef.current.emit("start-recording", { roomId })
            break
          case "stopRecording":
            socketRef.current.emit("stop-recording", {
              roomId,
              recordingName: message.recordingName,
            })
            break
          case "playRecording":
            socketRef.current.emit("play-recording", {
              roomId,
              recordingId: message.recordingId,
            })
            break
          case "toggleMetronome":
            socketRef.current.emit("toggle-metronome", { roomId })
            break
        }
      } else {
        console.warn("⚠️ Socket not connected, can't send message:", message.type)
        setError("No conectado al servidor")
      }
    },
    [roomId],
  )

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return

    // Prevenir múltiples conexiones simultáneas
    if (isConnecting.current) {
      console.log("🔄 Already connecting, skipping...")
      return
    }

    // Limpiar conexión anterior
    if (socketRef.current) {
      console.log("🧹 Cleaning previous connection...")
      socketRef.current.disconnect()
      socketRef.current = null
      hasJoinedRoom.current = false
    }

    isConnecting.current = true
    console.log(`🔌 Connecting to backend server for room ${roomId}...`)
    setError("Conectando...")

    // Obtener la URL del backend desde las variables de entorno
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://pianopartybackend.onrender.com"
    console.log(`🔌 Using backend URL: ${backendUrl}`)

    // Importar socket.io-client dinámicamente
    import("socket.io-client")
      .then(({ io }) => {
        // Verificar si ya hay una conexión en progreso
        if (!isConnecting.current) {
          console.log("🚫 Connection cancelled")
          return
        }

        const socket = io(backendUrl, {
          transports: ["websocket", "polling"],
          timeout: 10000,
          forceNew: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          autoConnect: true,
        })

        socketRef.current = socket

        // Timeout para detectar problemas
        const connectionTimeout = setTimeout(() => {
          if (!socket.connected) {
            setError(`Backend no disponible en ${backendUrl}. Intentando reconectar...`)
            console.error("❌ Connection timeout - backend not responding")
            isConnecting.current = false
          }
        }, 10000)

        socket.on("connect", () => {
          console.log("✅ Connected to backend server with ID:", socket.id)
          setIsConnected(true)
          setError(null)
          reconnectAttempts.current = 0
          isConnecting.current = false
          clearTimeout(connectionTimeout)

          // Unirse a la sala solo una vez
          if (!hasJoinedRoom.current) {
            console.log(`🏠 Joining room ${roomId} as ${playerName} (spectator: ${asSpectator})`)
            socket.emit("join-room", { roomId, playerName, asSpectator })
            hasJoinedRoom.current = true
          }
        })

        socket.on("disconnect", (reason) => {
          console.log("🔌 Disconnected:", reason)
          setIsConnected(false)
          hasJoinedRoom.current = false
          isConnecting.current = false

          if (reason !== "io client disconnect") {
            setError("Conexión perdida. Reconectando...")
          }
        })

        socket.on("connect_error", (err) => {
          console.error("❌ Connection error:", err)
          reconnectAttempts.current += 1
          isConnecting.current = false

          if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError(`No se puede conectar a ${backendUrl}. Verifica que el backend esté ejecutándose.`)
          } else {
            setError(`Reconectando (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
          }
        })

        socket.on("reconnect", () => {
          console.log("🔌 Reconnected successfully")
          setError(null)
          setIsConnected(true)
          hasJoinedRoom.current = false
          isConnecting.current = false
        })

        // Event listeners para la aplicación
        socket.on("room-joined", (data) => {
          console.log("🏠 Room joined:", data)
          stableHooks.onRoomUpdate?.(data)
        })

        socket.on("room-updated", (data) => {
          console.log("🔄 Room updated:", data)
          stableHooks.onRoomUpdate?.(data)
        })

        socket.on("key-pressed", (data) => {
          console.log("🎹 Key pressed:", data)
          stableHooks.onKeyPress?.(data)
        })

        socket.on("recording-playback", (data) => {
          console.log("🎬 Recording playback:", data)
          stableHooks.onRecordingPlayback?.(data)
        })

        socket.on("error", (data) => {
          console.error("❌ Socket error:", data)
          setError(data.message)
          stableHooks.onError?.(data.message)
        })
      })
      .catch((error) => {
        console.error("❌ Failed to load socket.io-client:", error)
        setError("Error cargando WebSocket")
        isConnecting.current = false
      })

    // Cleanup function
    return () => {
      console.log("🔌 Cleaning up WebSocket connection")
      isConnecting.current = false
      hasJoinedRoom.current = false
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [roomId, playerName, asSpectator]) // Removido stableHooks de las dependencias

  return {
    isConnected,
    sendMessage,
    error,
  }
}
