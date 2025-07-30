import React, { useEffect, useRef } from 'react'

export default function IconGenerator() {
  const canvasRef192 = useRef<HTMLCanvasElement>(null)
  const canvasRef512 = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Generate 192x192 icon
    if (canvasRef192.current) {
      const ctx = canvasRef192.current.getContext('2d')
      if (ctx) {
        drawIcon(ctx, 192)
      }
    }

    // Generate 512x512 icon
    if (canvasRef512.current) {
      const ctx = canvasRef512.current.getContext('2d')
      if (ctx) {
        drawIcon(ctx, 512)
      }
    }
  }, [])

  const drawIcon = (ctx: CanvasRenderingContext2D, size: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw rounded rectangle background
    const radius = size * 0.1
    ctx.fillStyle = '#3B82F6'
    ctx.beginPath()
    ctx.moveTo(radius, 0)
    ctx.lineTo(size - radius, 0)
    ctx.quadraticCurveTo(size, 0, size, radius)
    ctx.lineTo(size, size - radius)
    ctx.quadraticCurveTo(size, size, size - radius, size)
    ctx.lineTo(radius, size)
    ctx.quadraticCurveTo(0, size, 0, size - radius)
    ctx.lineTo(0, radius)
    ctx.quadraticCurveTo(0, 0, radius, 0)
    ctx.closePath()
    ctx.fill()

    // Draw "RE" text
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${size * 0.3}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('RE', size / 2, size / 2)

    // Add subtle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
    ctx.shadowBlur = size * 0.02
    ctx.shadowOffsetY = size * 0.01
    ctx.fillText('RE', size / 2, size / 2)
  }

  const downloadIcon = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">PWA Icon Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">192x192 Icon</h3>
          <canvas
            ref={canvasRef192}
            width={192}
            height={192}
            className="mx-auto mb-4 bg-white shadow-lg"
          />
          <button
            onClick={() => downloadIcon(canvasRef192.current, 'icon-192.png')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download icon-192.png
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">512x512 Icon</h3>
          <canvas
            ref={canvasRef512}
            width={512}
            height={512}
            className="mx-auto mb-4 bg-white shadow-lg"
            style={{ maxWidth: '192px', height: 'auto' }}
          />
          <button
            onClick={() => downloadIcon(canvasRef512.current, 'icon-512.png')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download icon-512.png
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Click the download buttons above to save the icons,
          then move them to the <code className="bg-blue-100 px-1 rounded">public</code> directory.
        </p>
      </div>
    </div>
  )
}