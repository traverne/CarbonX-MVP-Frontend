"use client"

import Link from "next/link"
import { WalletProvider, useWallet } from "@/contexts/wallet-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

type MintedItem = {
  id: string
  txid: string
  ts: number
  certification?: {
    project_name?: string
    issuer_name?: string
    amount?: number
    vintage_year?: number
    standard?: number
  }
}

function readMintedFromCookie(): MintedItem[] {
  try {
    const name = "carbonx_minted"
    const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
    const raw = m ? decodeURIComponent(m[1]) : "[]"
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function InnerDashboard() {
  const { isConnected } = useWallet()
  const [items, setItems] = useState<MintedItem[]>([])

  useEffect(() => {
    setItems(readMintedFromCookie())
  }, [])

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Credits</h1>
          <Link href="/mint">
            <Button>Mint New</Button>
          </Link>
        </div>

        {!isConnected ? (
          <Card className="p-6">
            <p className="text-sm mb-3">Connect your wallet to view owned credits.</p>
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              No credits found. Once you mint or purchase credits, they will appear here.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <Card key={it.id} className="p-4">
                <div className="text-xs text-muted-foreground mb-1">ID</div>
                <div className="font-mono break-all text-sm">{it.id}</div>
                <div className="mt-2 text-xs text-muted-foreground">Project</div>
                <div className="text-sm">{it.certification?.project_name || "—"}</div>
                <div className="mt-2 text-xs text-muted-foreground">Issuer</div>
                <div className="text-sm">{it.certification?.issuer_name || "—"}</div>
                <div className="mt-2 text-xs text-muted-foreground">Amount</div>
                <div className="text-sm">{it.certification?.amount ?? "—"}</div>
                <div className="mt-2 text-xs text-muted-foreground">Vintage</div>
                <div className="text-sm">{it.certification?.vintage_year ?? "—"}</div>
                <div className="mt-3">
                  <Link href={`/credit/${it.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <WalletProvider>
      <InnerDashboard />
    </WalletProvider>
  )
}
