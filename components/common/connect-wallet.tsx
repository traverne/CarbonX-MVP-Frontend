"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/wallet-context"

export function ConnectWallet() {
  const { address, isConnected, connect, disconnect } = useWallet()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button onClick={disconnect} variant="outline" size="sm">
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Button onClick={connect} size="sm">
      Connect Sync2
    </Button>
  )
}
