"use client"

import { WalletProvider } from "@/contexts/wallet-context"
import { Card } from "@/components/ui/card"

function InnerMarketplace() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-muted-foreground mb-6">Browse active listings and purchase with VET.</p>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            No listings loaded yet. This page is scaffolded and ready for data integration.
          </p>
        </Card>
      </div>
    </main>
  )
}

export default function MarketplacePage() {
  return (
    <WalletProvider>
      <InnerMarketplace />
    </WalletProvider>
  )
}
