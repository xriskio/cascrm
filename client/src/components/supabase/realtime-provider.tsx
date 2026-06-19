
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { db } from "@/lib/db"

interface RealtimeContextType {
  channel: RealtimeChannel | null
  isConnected: boolean
}

const RealtimeContext = createContext<RealtimeContextType>({
  channel: null,
  isConnected: false,
})

export const useRealtime = () => useContext(RealtimeContext)

interface RealtimeProviderProps {
  children: ReactNode
  channelName?: string
}

export function RealtimeProvider({ children, channelName = "public" }: RealtimeProviderProps) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Create and subscribe to the channel
    const realtimeChannel = db.channel(channelName)

    realtimeChannel
      .on("presence", { event: "sync" }, () => {
        setIsConnected(true)
      })
      .on("presence", { event: "join" }, ({ key }) => {
        console.log("User joined:", key)
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log("User left:", key)
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true)
        } else {
          setIsConnected(false)
        }
      })

    setChannel(realtimeChannel)

    return () => {
      realtimeChannel.unsubscribe()
    }
  }, [channelName])

  return <RealtimeContext.Provider value={{ channel, isConnected }}>{children}</RealtimeContext.Provider>
}

export default RealtimeProvider
