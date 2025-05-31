import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para formatear tiempo
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Función para generar ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Función para validar código de sala
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code)
}

// Función para formatear fecha
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")

  return `${day}/${month} ${hours}:${minutes}`
}

// Función para formatear duración
export function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
