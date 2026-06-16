"use client"

import { useRealtime } from "./realtime-provider"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react"

export function RealtimeStatus() {
  const { isConnected, connectionStatus } = useRealtime()

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3" />
      case "connecting":
        return <Loader2 className="h-3 w-3 animate-spin" />
      case "error":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <WifiOff className="h-3 w-3" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Live"
      case "connecting":
        return "Connecting"
      case "error":
        return "Error"
      default:
        return "Offline"
    }
  }

  return (
    <Badge variant="outline" className={`${getStatusColor()} text-white border-0`}>
      {getStatusIcon()}
      <span className="ml-1 text-xs">{getStatusText()}</span>
    </Badge>
  )
}
