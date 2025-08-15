"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface FileUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  disabled?: boolean
}

export function FileUpload({ onUpload, currentImage, disabled }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        onUpload(data.url)
      } else {
        const errorData = await response.json()
        alert(`Upload failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Label>Product Image</Label>
      
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={disabled ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-400">
              PNG, JPG, WebP up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Current Image Preview */}
      {currentImage && (
        <div className="space-y-2">
          <Label>Current Image:</Label>
          <div className="relative inline-block">
            <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
              <img
                src={currentImage}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={() => onUpload('/images/placeholder.svg')}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">{currentImage}</p>
        </div>
      )}

      {/* Quick Select Options */}
      <div className="space-y-2">
        <Label>Or select from existing images:</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { url: '/images/placeholder.svg', name: 'Placeholder' },
            { url: '/images/no-image/image.webp', name: 'No Image' },
            { url: '/images/wireless-headphone/wireless-headphone.webp', name: 'Headphones' },
            { url: '/images/smartphone/smartphone.webp', name: 'Smartphone' }
          ].map((option) => (
            <button
              key={option.url}
              type="button"
              className={`p-2 border rounded-lg hover:border-blue-500 transition-colors ${
                currentImage === option.url ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !disabled && onUpload(option.url)}
              disabled={disabled}
            >
              <div className="relative w-16 h-16 mx-auto mb-1">
                <img
                  src={option.url}
                  alt={option.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <p className="text-xs text-gray-600">{option.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}