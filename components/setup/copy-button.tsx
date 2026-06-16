"use client"

import { useState } from "react"

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleCopy} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
      {copied ? "Copied!" : "Copy All"}
    </button>
  )
}
