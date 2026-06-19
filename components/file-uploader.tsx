"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void
  acceptedFileTypes?: string[]
  maxSizeMB?: number
}

export function FileUploader({ onFileSelect, acceptedFileTypes = [".pdf"], maxSizeMB = 10 }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file type
    if (acceptedFileTypes.length > 0) {
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
      if (!acceptedFileTypes.includes(fileExtension) && !acceptedFileTypes.includes(file.type)) {
        setFileError(`Invalid file type. Accepted types: ${acceptedFileTypes.join(", ")}`)
        return false
      }
    }

    // Check file size
    if (maxSizeMB > 0 && file.size > maxSizeMB * 1024 * 1024) {
      setFileError(`File size exceeds ${maxSizeMB}MB limit`)
      return false
    }

    setFileError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        console.log("File uploaded:", file.name, file.type, file.size)
        onFileSelect(file)
        console.log("File sent to parent:", file.name)
      } else {
        onFileSelect(null)
        console.log("File not sent to parent due to validation error")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        console.log("File selected:", file.name, file.type, file.size)
        onFileSelect(file)
        console.log("File sent to parent:", file.name)
      } else {
        onFileSelect(null)
        console.log("File not sent to parent due to validation error")
      }
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    onFileSelect(null)
    console.log("File removed, null sent to parent")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={acceptedFileTypes.join(",")}
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-md p-6 text-center ${
            dragActive ? "border-blue-500 bg-blue-500/10" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground mb-1">
              <span className="font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {acceptedFileTypes.join(", ")} (Max {maxSizeMB}MB)
            </p>
            <button
              type="button"
              onClick={handleButtonClick}
              className="mt-4 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted"
            >
              Select File
            </button>
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-500/15 p-2 rounded-md mr-3">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div className="truncate">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1 rounded-full hover:bg-muted"
              aria-label="Remove file"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
    </div>
  )
}
