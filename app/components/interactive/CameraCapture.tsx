'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, X, RotateCw, FlipHorizontal, Check, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/lib/utils'

export interface CameraCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (imageSrc: string) => void
  title?: string
  allowGallery?: boolean
}

export function CameraCapture({
  open,
  onOpenChange,
  onCapture,
  title = 'Capture Food Photo',
  allowGallery = true,
}: CameraCaptureProps) {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isFlashing, setIsFlashing] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const videoConstraints = {
    facingMode,
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  }

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      // Flash effect
      setIsFlashing(true)
      setTimeout(() => setIsFlashing(false), 200)
      setCapturedImage(imageSrc)
    }
  }, [])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
  }, [])

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
      setCapturedImage(null)
      onOpenChange(false)
    }
  }, [capturedImage, onCapture, onOpenChange])

  const handleFlipCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
  }, [])

  const handleGalleryUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageSrc = event.target?.result as string
        setCapturedImage(imageSrc)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleClose = useCallback(() => {
    setCapturedImage(null)
    onOpenChange(false)
  }, [onOpenChange])

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <div className="w-10" />
          </div>
        </div>

        {/* Camera/Preview */}
        <div className="relative w-full h-full flex items-center justify-center">
          {capturedImage ? (
            // Preview captured image
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full h-full"
            >
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            </motion.div>
          ) : (
            // Camera view
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-full object-cover"
                mirrored={facingMode === 'user'}
              />

              {/* Camera overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-80 h-80">
                  {/* Corner guides */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                  {/* Center text */}
                  <div className="absolute inset-0 flex items-end justify-center pb-8">
                    <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                      <p className="text-white text-sm font-medium">Center your food</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Flash overlay */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-8">
          {capturedImage ? (
            // Preview controls
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleRetake}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors">
                  <RotateCw className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-sm font-medium">Retake</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleConfirm}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
                <span className="text-white text-sm font-medium">Use Photo</span>
              </motion.button>
            </div>
          ) : (
            // Capture controls
            <div className="flex items-end justify-between">
              {/* Gallery button */}
              {allowGallery && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors overflow-hidden">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs">Gallery</span>
                </motion.button>
              )}

              {/* Capture button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCapture}
                className="flex flex-col items-center gap-2 mx-auto"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full border-4 border-black" />
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute inset-0 rounded-full bg-white"
                  />
                </div>
              </motion.button>

              {/* Flip camera button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFlipCamera}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors">
                  <FlipHorizontal className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs">Flip</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleGalleryUpload}
        />
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for using camera capture
export function useCameraCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const handleCapture = useCallback((imageSrc: string) => {
    setCapturedImage(imageSrc)
  }, [])

  return {
    isOpen,
    open,
    close,
    capturedImage,
    handleCapture,
    CameraCaptureComponent: (props: Omit<CameraCaptureProps, 'open' | 'onOpenChange' | 'onCapture'>) => (
      <CameraCapture
        open={isOpen}
        onOpenChange={setIsOpen}
        onCapture={handleCapture}
        {...props}
      />
    ),
  }
}
