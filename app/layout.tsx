import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Piano Party - Multiplayer Piano App",
  description: "Toca piano en tiempo real con tus amigos desde cualquier dispositivo",
  keywords: ["piano", "multiplayer", "music", "collaboration", "real-time"],
  authors: [{ name: "Piano Party Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
