"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConnectWallet } from "@/components/common/connect-wallet"
import { WalletProvider } from "@/contexts/wallet-context"

export default function HomePage() {
  return (
    <WalletProvider>
      <main className="min-h-dvh flex flex-col">
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg">
              CarbonX
            </Link>
            <nav className="flex items-center gap-3">
              <Link href="/mint" className="text-sm">
                Mint
              </Link>
              <Link href="/dashboard" className="text-sm">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-sm">
                Marketplace
              </Link>
              <ConnectWallet />
            </nav>
          </div>
        </header>

        <section className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-balance">
                Issue, Trade, and Retire Carbon Credits on VeChain
              </h1>
              <p className="text-muted-foreground text-pretty">
                CarbonX is a decentralized marketplace for verified carbon credits. Connect your Sync2 wallet to mint
                credits, list them for sale, and retire to offset emissions.
              </p>
              <div className="flex gap-3">
                <Link href="/mint">
                  <Button size="lg">Get Started — Mint</Button>
                </Link>
                <Link href="/marketplace">
                  <Button variant="outline" size="lg">
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-2">Highlights</h2>
              <ul className="text-sm space-y-2">
                <li>• Verified issuance with validator signatures</li>
                <li>• Transparent marketplace pricing in VET</li>
                <li>• Permanent retirement with on-chain proof</li>
              </ul>
              <div className="mt-6">
                <ConnectWallet />
              </div>
            </Card>
          </div>
        </section>

        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground">
            © {new Date().getFullYear()} CarbonX — Built on VeChainThor
          </div>
        </footer>
      </main>
    </WalletProvider>
  )
}
