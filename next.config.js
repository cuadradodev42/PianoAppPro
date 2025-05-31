/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Desactivar para evitar problemas con WebSocket
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configuración para WebSocket
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }

    // Ignorar warnings de módulos opcionales
    config.ignoreWarnings = [
      { module: /node_modules\/ws\/lib/ },
      { module: /node_modules\/bufferutil/ },
      { module: /node_modules\/utf-8-validate/ },
    ]

    return config
  },
  // Configuración experimental para App Router
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
