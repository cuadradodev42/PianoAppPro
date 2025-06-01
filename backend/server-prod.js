const { createServer } = require("http")
const { Server: SocketIOServer } = require("socket.io")
const { SCALES } = require("./constants")

const PORT = process.env.PORT || 3001

// Configurar CORS para producción
const corsOrigins = require('cors');
app.use(cors({
  origin: 'https://piano-app-pro.vercel.app',
  credentials: true
}));

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
      isMetronomeOn: false,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isRecording: false,
      currentRecording: [],
      recordings: [],
      selectedScale: "C Major",
    }
    this.rooms.set(roomId, room)
    console.log(`✅ Room created: ${roomId}`)
    return room
  }

  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  getAvailableKeysInScale(room) {
    const scale = room.selectedScale || "C Major"
    const scaleIndices = SCALES[scale] || SCALES["C Major"]

    const usedKeys = new Set(
      Array.from(room.players.values())
        .filter((p) => !p.isSpectator && p.keyIndex >= 0)
        .map((p) => p.keyIndex),
    )

    const availableKeys = scaleIndices.filter((index) => !usedKeys.has(index))
    return availableKeys
  }

  reassignKeysForScale(room) {
    const scaleIndices = SCALES[room.selectedScale] || SCALES["C Major"]
    const activePlayers = Array.from(room.players.values()).filter((p) => !p.isSpectator)

    const availableKeys = [...scaleIndices]

    activePlayers.forEach((player, idx) => {
      if (idx < availableKeys.length) {
        const newKeyIndex = availableKeys[idx]
        player.keyIndex = newKeyIndex
      } else {
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
      const availableKeys = this.getAvailableKeysInScale(room)

      if (availableKeys.length > 0) {
        keyIndex = availableKeys[0]
      } else {
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

    if (room.players.size === 0) {
      this.rooms.delete(roomId)
      return { room: null, roomId }
    }

    return { room, roomId }
  }

  updateRoomSettings(roomId, settings) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    if (settings.selectedScale && settings.selectedScale !== room.selectedScale) {
      Object.assign(room, settings)
      this.reassignKeysForScale(room)
    } else {
      Object.assign(room, settings)
    }

    room.lastActivity = Date.now()

    if (room.isRecording) {
      const now = Date.now()
      const startTime = room.currentRecording[0]?.timestamp || now

      Object.keys(settings).forEach((key) => {
        room.currentRecording.push({
          type: `${key}Change`,
          timestamp: now,
          [key]: settings[key],
          relativeTime: now - startTime,
        })
      })
    }

    return room
  }

  startRecording(roomId) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    room.isRecording = true
    room.currentRecording = []
    room.lastActivity = Date.now()

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
      isMetronomeOn: room.isMetronomeOn,
      selectedScale: room.selectedScale,
      recordings: room.recordings.map((r) => ({
        id: r.id,
        name: r.name,
        duration: r.duration,
        createdAt: r.createdAt,
        playerCount: r.playerCount,
      })),
    }
  }

  getRecording(roomId, recordingId) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    return room.recordings.find((r) => r.id === recordingId) || null
  }

  cleanupInactiveRooms() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > oneHour) {
        this.rooms.delete(roomId)
        for (const player of room.players.values()) {
          this.playerToRoom.delete(player.id)
        }
        console.log(`🧹 Cleaned up inactive room: ${roomId}`)
      }
    }
  }
}

// Crear servidor HTTP
const httpServer = createServer((req, res) => {
  // Health check endpoint para Railway/Render
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }))
    return
  }

  res.writeHead(404)
  res.end("Not found")
})

// Configurar Socket.IO para producción
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
  allowEIO3: true,
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

      socket.join(roomId)

      socket.emit("room-joined", {
        room: roomManager.getRoomData(room),
        myKeyIndex: keyIndex,
        isSpectator: keyIndex === -1,
      })

      socket.to(roomId).emit("room-updated", {
        room: roomManager.getRoomData(room),
      })
    } catch (error) {
      console.error("Error joining room:", error)
      socket.emit("error", { message: "Failed to join room" })
    }
  })

  socket.on("key-press", ({ roomId, keyIndex, frequency }) => {
    const room = roomManager.getRoom(roomId)
    if (!room) return

    const player = room.players.get(socket.id)
    if (!player || player.keyIndex !== keyIndex || player.isSpectator) {
      socket.emit("error", { message: "Invalid key press" })
      return
    }

    const scaleIndices = SCALES[room.selectedScale] || SCALES["C Major"]
    if (!scaleIndices.includes(keyIndex)) {
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

    roomManager.addKeyPressToRecording(roomId, keyPressEvent)
    io.to(roomId).emit("key-pressed", keyPressEvent)
    room.lastActivity = Date.now()
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
      io.to(roomId).emit("room-updated", {
        room: roomManager.getRoomData(room),
      })

      Array.from(room.players.values()).forEach((player) => {
        const playerSocket = io.sockets.sockets.get(player.id)
        if (playerSocket) {
          playerSocket.emit("room-joined", {
            room: roomManager.getRoomData(room),
            myKeyIndex: player.keyIndex,
            isSpectator: player.isSpectator,
          })
        }
      })
    }
  })

  socket.on("toggle-metronome", ({ roomId }) => {
    const room = roomManager.getRoom(roomId)
    if (room) {
      const newMetronomeState = !room.isMetronomeOn
      const updatedRoom = roomManager.updateRoomSettings(roomId, {
        isMetronomeOn: newMetronomeState,
      })

      if (updatedRoom) {
        io.to(roomId).emit("room-updated", {
          room: roomManager.getRoomData(updatedRoom),
        })
      }
    }
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

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)

    const { room, roomId } = roomManager.leaveRoom(socket.id)
    if (room && roomId) {
      socket.to(roomId).emit("room-updated", {
        room: roomManager.getRoomData(room),
      })
    }
  })
})

// Cleanup on exit
process.on("SIGTERM", () => {
  clearInterval(cleanupInterval)
  httpServer.close()
})

process.on("SIGINT", () => {
  clearInterval(cleanupInterval)
  httpServer.close()
})

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
  console.log(`📡 Socket.IO ready for connections`)
  console.log(`🎹 Piano Party Backend - Production Ready!`)
})
