"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getConnex } from "@/lib/connex/setup"

type Ctx = {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<Ctx | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("walletAddress")
    if (saved) {
      setAddress(saved)
      setIsConnected(true)
    }
  }, [])

  const connect = async () => {
    const connex = await getConnex()
    const res = await connex.vendor
      .sign("cert", {
        purpose: "identification",
        payload: {
          type: "text",
          content: "Sign to connect to CarbonX",
        },
      })
      .request()

    const signer = res.annex.signer
    setAddress(signer)
    setIsConnected(true)
    localStorage.setItem("walletAddress", signer)
  }

  const disconnect = () => {
    setAddress(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
  }

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect }}>{children}</WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within WalletProvider")
  return ctx
}
