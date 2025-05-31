"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Music2 } from "lucide-react"
import { SCALE_NAMES } from "@/constants"

interface ScaleSelectorProps {
  selectedScale: string
  onScaleChange: (scale: string) => void
  disabled?: boolean
}

export default function ScaleSelector({ selectedScale, onScaleChange, disabled = false }: ScaleSelectorProps) {
  return (
    <Card className={disabled ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Music2 className="h-5 w-5" />
          <span>Escala Musical</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedScale} onValueChange={onScaleChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una escala" />
          </SelectTrigger>
          <SelectContent>
            {SCALE_NAMES.map((scale) => (
              <SelectItem key={scale} value={scale}>
                <div className="flex items-center justify-between w-full">
                  <span>{scale}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {scale.includes("Pentatonic") ? "Pentatónica" : "Mayor"}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-xs text-gray-500 text-center">
          <p>Las escalas determinan qué notas pueden tocar los jugadores</p>
        </div>

        {disabled && (
          <div className="text-center">
            <p className="text-xs text-gray-500">Los espectadores no pueden cambiar la escala</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
