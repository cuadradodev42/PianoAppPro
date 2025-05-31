const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

// Configuración de Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

async function startServer() {
  try {
    // Preparar la aplicación Next.js
    await app.prepare()
    console.log("✅ Next.js app prepared")

    // Crear servidor HTTP
    const httpServer = createServer(async (req, res) => {
      try {
        // Agregar headers CORS para desarrollo
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

        // Manejar preflight OPTIONS
        if (req.method === "OPTIONS") {
          res.writeHead(200)
          res.end()
          return
        }

        const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error("❌ Error occurred handling", req.url, err)
        res.statusCode = 500
        res.end("Internal server error")
      }
    })

    // Configurar Socket.IO solo después de que Next.js esté listo
    const { setupSocketServer } = require("./lib/socket-server.js")
    const io = setupSocketServer(httpServer)
    console.log("✅ Socket.IO server configured")

    // Manejar errores del servidor
    httpServer.on("error", (err) => {
      console.error("❌ Server error:", err)
      process.exit(1)
    })

    // Iniciar el servidor
    httpServer.listen(port, () => {
      console.log(`🚀 Server ready on http://${hostname}:${port}`)
      console.log(`📡 Socket.IO ready for connections`)
    })

    // Manejar cierre graceful
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down gracefully")
      httpServer.close(() => {
        console.log("✅ Server closed")
        process.exit(0)
      })
    })

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received, shutting down gracefully")
      httpServer.close(() => {
        console.log("✅ Server closed")
        process.exit(0)
      })
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

// Iniciar el servidor
startServer()
