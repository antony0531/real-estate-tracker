import React, { useState, useRef } from 'react'
import { Camera, X, CheckCircle, RotateCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCapturing(true)
        setError(null)
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      stopCamera()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      cleanup()
    }
  }

  const cleanup = () => {
    stopCamera()
    setCapturedImage(null)
    onClose()
  }

  React.useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white font-semibold">Capture Photo</h2>
        <button
          onClick={cleanup}
          className="text-white hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="text-center p-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          </div>
        ) : !isCapturing && !capturedImage ? (
          <button
            onClick={startCamera}
            className="flex flex-col items-center gap-4 px-8 py-6 bg-white/10 backdrop-blur rounded-xl hover:bg-white/20 transition-colors"
          >
            <Camera className="w-16 h-16 text-white" />
            <span className="text-white text-lg">Open Camera</span>
          </button>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/50">
        <AnimatePresence mode="wait">
          {!capturedImage && isCapturing ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full" />
              </button>
            </motion.div>
          ) : capturedImage ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center gap-4"
            >
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCw className="w-5 h-5" />
                Retake
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                Use Photo
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}