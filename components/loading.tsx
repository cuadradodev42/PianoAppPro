"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Piano, Loader2 } from "lucide-react"

interface LoadingProps {
  message?: string
  progress?: number
}

export default function Loading({ message = "Cargando...", progress }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Piano className="h-16 w-16 text-purple-600" />
              <Loader2 className="h-6 w-6 text-purple-400 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">Piano Party</h2>
            <p className="text-gray-600">{message}</p>

            {progress !== undefined && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
