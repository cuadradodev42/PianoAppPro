const { Server: SocketIOServer } = require("socket.io")
const { SCALES } = require("./constants")

class RoomManager {
  constructor() {
    this.rooms = new Map()
    this.playerToRoom = new Map()
  }

  createRoom(roomId) {
    const room = {
      id: roomId,
      players: new Map(),
      bpm: 120,
      volume: 0.7,
      isPlaying: false,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isRecording: false,
      currentRecording: [],
      recordings: [],
      selectedScale: "C Major",
      isMetronomeOn: false,
    }
    this.rooms.set(roomId, room)
    console.log(`✅ Room created: ${roomId}`)
    return room
  }

  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  // Obtener las teclas disponibles en la escala actual
  getAvailableKeysInScale(room) {
    const scale = room.selectedScale || "C Major"
    const scaleIndices = SCALES[scale] || SCALES["C Major"]

    // Obtener las teclas ya asignadas
    const usedKeys = new Set(
      Array.from(room.players.values())
        .filter((p) => !p.isSpectator)
        .map((p) => p.keyIndex),
    )

    // Filtrar las teclas de la escala que no están en uso
    return scaleIndices.filter((index) => !usedKeys.has(index))
  }

  // Reasignar teclas cuando cambia la escala
  reassignKeysForScale(room) {
    const scaleIndices = SCALES[room.selectedScale] || SCALES["C Major"]
    const activePlayers = Array.from(room.players.values()).filter((p) => !p.isSpectator)

    // Crear una copia de los índices de la escala para asignar
    const availableKeys = [...scaleIndices]

    // Reasignar teclas a cada jugador
    activePlayers.forEach((player, idx) => {
      if (idx < availableKeys.length) {
        player.keyIndex = availableKeys[idx]
      } else {
        // Si no hay suficientes teclas, convertir a espectador
        player.keyIndex = -1
        player.isSpectator = true
      }
    })

    return room
  }

  joinRoom(roomId, player, asSpectator = false) {
    let room = this.rooms.get(roomId)
    if (!room) {
      room = this.createRoom(roomId)
    }

    let keyIndex = -1

    if (!asSpectator) {
      // Obtener teclas disponibles en la escala actual
      const availableKeys = this.getAvailableKeysInScale(room)

      if (availableKeys.length > 0) {
        // Asignar la primera tecla disponible en la escala
        keyIndex = availableKeys[0]
      } else {
        // Si no hay teclas disponibles, unirse como espectador
        asSpectator = true
      }
    }

    const fullPlayer = {
      ...player,
      keyIndex,
      joinedAt: Date.now(),
      isSpectator: asSpectator,
    }

    room.players.set(player.id, fullPlayer)
    this.playerToRoom.set(player.id, roomId)
    room.lastActivity = Date.now()

    console.log(
      `👤 Player ${player.name} joined room ${roomId} as ${asSpectator ? "spectator" : `player with key ${keyIndex}`}`,
    )
    return { room, keyIndex }
  }

  leaveRoom(playerId) {
    const roomId = this.playerToRoom.get(playerId)
    if (!roomId) return { room: null, roomId: null }

    const room = this.rooms.get(roomId)
    if (!room) return { room: null, roomId }

    room.players.delete(playerId)
    this.playerToRoom.delete(playerId)
    room.lastActivity = Date.now()

    console.log(`👋 Player ${playerId} left room ${roomId}`)

    // Eliminar sala si está vacía
    if (room.players.size === 0) {
      this.rooms.delete(roomId)
      console.log(`🗑️ Empty room ${roomId} deleted`)
      return { room: null, roomId }
    }

    return { room, roomId }
  }

  updateRoomSettings(roomId, settings) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Si cambia la escala, reasignar teclas
    if (settings.selectedScale && settings.selectedScale !== room.selectedScale) {
      Object.assign(room, settings)
      this.reassignKeysForScale(room)
    } else {
      Object.assign(room, settings)
    }

    room.lastActivity = Date.now()

    // Agregar evento a la grabación si está activa
    if (room.isRecording) {
      const now = Date.now()
      const startTime = room.currentRecording[0]?.timestamp || now

      if (settings.bpm !== undefined) {
        room.currentRecording.push({
          type: "bpmChange",
          timestamp: now,
          bpm: settings.bpm,
          relativeTime: now - startTime,
        })
      }

      if (settings.volume !== undefined) {
        room.currentRecording.push({
          type: "volumeChange",
          timestamp: now,
          volume: settings.volume,
          relativeTime: now - startTime,
        })
      }

      if (settings.selectedScale !== undefined) {
        room.currentRecording.push({
          type: "scaleChange",
          timestamp: now,
          selectedScale: settings.selectedScale,
          relativeTime: now - startTime,
        })
      }

      if (settings.isMetronomeOn !== undefined) {
        room.currentRecording.push({
          type: "metronomeToggle",
          timestamp: now,
          isMetronomeOn: settings.isMetronomeOn,
          relativeTime: now - startTime,
        })
      }
    }

    return room
  }

  startRecording(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    room.isRecording = true
    room.currentRecording = []
    room.lastActivity = Date.now()

    console.log(`🎬 Recording started in room ${roomId}`)
    return room
  }

  stopRecording(roomId, recordingName) {
    const room = this.rooms.get(roomId)
    if (!room || !room.isRecording) return null

    const recording = {
      id: Math.random().toString(36).substring(2, 15),
      name: recordingName || `Recording ${room.recordings.length + 1}`,
      duration: room.currentRecording.length > 0 ? Math.max(...room.currentRecording.map((e) => e.relativeTime)) : 0,
      events: [...room.currentRecording],
      createdAt: Date.now(),
      playerCount: Array.from(room.players.values()).filter((p) => !p.isSpectator).length,
    }

    room.recordings.push(recording)
    room.isRecording = false
    room.currentRecording = []
    room.lastActivity = Date.now()

    console.log(`🎬 Recording "${recordingName}" saved in room ${roomId}`)
    return room
  }

  addKeyPressToRecording(roomId, event) {
    const room = this.rooms.get(roomId)
    if (!room || !room.isRecording) return

    const now = Date.now()
    const startTime = room.currentRecording[0]?.timestamp || now

    room.currentRecording.push({
      type: "keyPress",
      keyIndex: event.keyIndex,
      playerId: event.playerId,
      playerName: event.playerName,
      timestamp: now,
      frequency: event.frequency,
      relativeTime: now - startTime,
    })
  }

  getRoomData(room) {
    return {
      id: room.id,
      players: Array.from(room.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        keyIndex: p.keyIndex,
        isConnected: p.isConnected,
        isSpectator: p.isSpectator,
      })),
      bpm: room.bpm,
      volume: room.volume,
      isPlaying: room.isPlaying,
      isRecording: room.isRecording,
      selectedScale: room.selectedScale,
      recordings: room.recordings.map((r) => ({
        id: r.id,
        name: r.name,
        duration: r.duration,
        createdAt: r.createdAt,
        playerCount: r.playerCount,
      })),
      isMetronomeOn: room.isMetronomeOn,
    }
  }

  getRecording(roomId, recordingId) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    return room.recordings.find((r) => r.id === recordingId) || null
  }

  // Limpiar salas inactivas (más de 1 hora sin actividad)
  cleanupInactiveRooms() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > oneHour) {
        this.rooms.delete(roomId)
        // Limpiar referencias de jugadores
        for (const player of room.players.values()) {
          this.playerToRoom.delete(player.id)
        }
        console.log(`🧹 Cleaned up inactive room: ${roomId}`)
      }
    }
  }
}

function setupSocketServer(httpServer) {
  try {
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*", // Permitir cualquier origen en desarrollo
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
      allowEIO3: true, // Permitir compatibilidad con versiones anteriores
    })

    const roomManager = new RoomManager()

    // Limpiar salas inactivas cada 30 minutos
    const cleanupInterval = setInterval(
      () => {
        roomManager.cleanupInactiveRooms()
      },
      30 * 60 * 1000,
    )

    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`)

      socket.on("join-room", ({ roomId, playerName, asSpectator }) => {
        try {
          const player = {
            id: socket.id,
            name: playerName,
            socketId: socket.id,
            isConnected: true,
            joinedAt: Date.now(),
            isSpectator: false,
          }

          const { room, keyIndex } = roomManager.joinRoom(roomId, player, asSpectator)

          // Unirse al room de Socket.IO
          socket.join(roomId)

          console.log(`🎹 Player ${playerName} assigned key index: ${keyIndex}`)

          // Enviar datos iniciales al jugador
          socket.emit("room-joined", {
            room: roomManager.getRoomData(room),
            myKeyIndex: keyIndex,
            isSpectator: keyIndex === -1,
          })

          // Notificar a otros jugadores
          socket.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        } catch (error) {
          console.error("Error joining room:", error)
          socket.emit("error", { message: error instanceof Error ? error.message : "Failed to join room" })
        }
      })

      socket.on("key-press", ({ roomId, keyIndex, frequency }) => {
        const room = roomManager.getRoom(roomId)
        if (!room) {
          console.warn(`Room ${roomId} not found`)
          return
        }

        const player = room.players.get(socket.id)
        if (!player || player.keyIndex !== keyIndex || player.isSpectator) {
          console.warn(`Invalid key press from ${socket.id}: keyIndex=${keyIndex}, playerKeyIndex=${player?.keyIndex}`)
          socket.emit("error", { message: "Invalid key press" })
          return
        }

        // Verificar que la tecla está en la escala actual
        const scaleIndices = SCALES[room.selectedScale] || SCALES["C Major"]
        if (!scaleIndices.includes(keyIndex)) {
          console.warn(`Key ${keyIndex} is not in scale ${room.selectedScale}`)
          socket.emit("error", { message: "Key not in scale" })
          return
        }

        const keyPressEvent = {
          keyIndex,
          playerId: socket.id,
          playerName: player.name,
          timestamp: Date.now(),
          frequency,
        }

        console.log(`🎹 Key press: ${player.name} pressed key ${keyIndex} (${frequency}Hz)`)

        // Agregar a grabación si está activa
        roomManager.addKeyPressToRecording(roomId, keyPressEvent)

        // Broadcast a todos los jugadores en la sala (incluyendo el emisor)
        io.to(roomId).emit("key-pressed", keyPressEvent)

        room.lastActivity = Date.now()
      })

      socket.on("start-recording", ({ roomId }) => {
        const room = roomManager.startRecording(roomId)
        if (room) {
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("stop-recording", ({ roomId, recordingName }) => {
        const room = roomManager.stopRecording(roomId, recordingName)
        if (room) {
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("play-recording", ({ roomId, recordingId }) => {
        const recording = roomManager.getRecording(roomId, recordingId)
        if (recording) {
          io.to(roomId).emit("recording-playback", { recording })
        }
      })

      socket.on("update-bpm", ({ roomId, bpm }) => {
        const room = roomManager.updateRoomSettings(roomId, { bpm })
        if (room) {
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("update-volume", ({ roomId, volume }) => {
        const room = roomManager.updateRoomSettings(roomId, { volume })
        if (room) {
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("update-scale", ({ roomId, selectedScale }) => {
        const room = roomManager.updateRoomSettings(roomId, { selectedScale })
        if (room) {
          // Notificar a todos los jugadores sobre el cambio de escala y las nuevas asignaciones de teclas
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })

          // Notificar individualmente a cada jugador su nueva tecla
          Array.from(room.players.values()).forEach((player) => {
            const socket = io.sockets.sockets.get(player.id)
            if (socket) {
              socket.emit("room-joined", {
                room: roomManager.getRoomData(room),
                myKeyIndex: player.keyIndex,
                isSpectator: player.isSpectator,
              })
            }
          })
        }
      })

      socket.on("update-metronome", ({ roomId, isMetronomeOn }) => {
        const room = roomManager.updateRoomSettings(roomId, { isMetronomeOn })
        if (room) {
          io.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`)

        const { room, roomId } = roomManager.leaveRoom(socket.id)
        if (room && roomId) {
          // Notificar a otros jugadores
          socket.to(roomId).emit("room-updated", {
            room: roomManager.getRoomData(room),
          })
        }
      })

      socket.on("error", (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error)
      })
    })

    // Limpiar interval al cerrar
    io.on("close", () => {
      clearInterval(cleanupInterval)
    })

    console.log("🚀 Socket.IO server initialized successfully")
    return io
  } catch (error) {
    console.error("❌ Failed to setup Socket.IO server:", error)
    throw error
  }
}

module.exports = { setupSocketServer }
