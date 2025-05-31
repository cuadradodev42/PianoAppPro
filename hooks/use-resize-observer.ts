"use client"

import { useEffect, useState, type RefObject } from "react"

interface Size {
  width: number | undefined
  height: number | undefined
}

export function useResizeObserver<T extends HTMLElement>(ref: RefObject<T>): Size {
  const [size, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })

  useEffect(() => {
    if (!ref.current) return

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setSize({ width, height })
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref])

  return size
}

