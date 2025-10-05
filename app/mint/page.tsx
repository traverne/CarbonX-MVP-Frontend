"use client"

import { useState } from "react"
import { WalletProvider, useWallet } from "@/contexts/wallet-context"
import { CertificationForm, type CertificationFormData } from "@/components/mint/certification-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSignature } from "@/hooks/use-signature"
import { registrarAbi } from "@/lib/contracts/registrar-abi"
import { REGISTRAR_ADDRESS } from "@/lib/utils/constants"
import { waitForTransaction } from "@/lib/connex/utils"
import Link from "next/link"
import { normalizeToHexBytes } from "@/lib/signature/helpers"
import { getConnex } from "@/lib/connex/setup"

function InnerMintPage() {
  const { isConnected, address } = useWallet()
  const [txId, setTxId] = useState<string | null>(null)
  const [mintedId, setMintedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    signature,
    creditId,
    loading: sigLoading,
    error: sigError,
    requestValidatorSignature,
    reset: resetSig,
    salt, // use salt from hook
  } = useSignature()

  const handleRequestSignature = async (data: CertificationFormData) => {
    setError(null)
    resetSig()

    // Generate a random salt (bytes32-ish hex) client-side
    const salt = `0x${crypto.getRandomValues(new Uint8Array(32)).reduce((acc, b) => acc + b.toString(16).padStart(2, "0"), "")}`

    // Normalize expiry to unix seconds or 0
    const expiry = data.expiry ? Math.floor(new Date(data.expiry).getTime() / 1000) : 0

    await requestValidatorSignature({
      certification: {
        project_name: data.project_name,
        issuer_name: data.issuer_name,
        location: data.location,
        methodology: data.methodology,
        amount: Number(data.amount),
        vintage_year: Number(data.vintage_year),
        expiry,
        standard: Number(data.standard),
      },
      salt,
      validationProof: data.validation_proof,
    })
  }

  const handleMint = async (data: CertificationFormData) => {
    setError(null)
    setTxId(null)
    setMintedId(null)
    if (!isConnected || !address) {
      setError("Please connect your Sync2 wallet.")
      return
    }
    if (!signature || !creditId) {
      setError("Please request a validator signature first.")
      return
    }

    try {
      const connex = await getConnex()
      const expiry = data.expiry ? Math.floor(new Date(data.expiry).getTime() / 1000) : 0
      const recipient =
        data.recipient && data.recipient.length > 0 ? data.recipient : "0x0000000000000000000000000000000000000000"

      const certificationTuple = [
        data.project_name,
        data.issuer_name,
        data.location,
        data.methodology,
        Number(data.amount),
        Number(data.vintage_year),
        expiry,
        Number(data.standard),
      ]

      const validationProofBytes = normalizeToHexBytes(data.validation_proof)

      const method = registrarAbi.find((f) => f.name === "issue")!
      const clause = connex.thor
        .account(REGISTRAR_ADDRESS)
        .method(method as any)
        .asClause(certificationTuple, recipient, salt ?? "0x" + "00".repeat(32), validationProofBytes, signature)

      const res = await connex.vendor.sign("tx", [clause]).comment("CarbonX: Issue Credit").request()

      setTxId(res.txid)
      const receipt = await waitForTransaction(res.txid)
      setMintedId(creditId!)

      if (receipt?.reverted) {
        setError("Transaction reverted.")
      } else {
        try {
          const item = {
            id: creditId!,
            txid: res.txid,
            ts: Math.floor(Date.now() / 1000),
            certification: {
              project_name: data.project_name,
              issuer_name: data.issuer_name,
              amount: Number(data.amount),
              vintage_year: Number(data.vintage_year),
              standard: Number(data.standard),
            },
          }
          const name = "carbonx_minted"
          const existing = (() => {
            const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"))
            return m ? decodeURIComponent(m[1]) : "[]"
          })()
          let list: any[] = []
          try {
            list = JSON.parse(existing)
          } catch {
            list = []
          }
          // dedupe by id
          if (!list.find((x) => x.id === item.id)) list.unshift(item)
          const value = encodeURIComponent(JSON.stringify(list.slice(0, 50)))
          document.cookie = `${name}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 365}`
        } catch (e) {
          // ignore cookie errors silently
        }
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to mint credit.")
    }
  }

  return (
    <main className="min-h-dvh">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Mint Carbon Credit</h1>
        <p className="text-muted-foreground mb-8">
          Fill in the certification details, request a validator signature, then mint via Sync2.
        </p>

        {!isConnected && (
          <Card className="p-6 mb-8">
            <p className="text-sm mb-3">You must connect your wallet to mint.</p>
            <Link href="/">
              <Button>Go to Home to Connect</Button>
            </Link>
          </Card>
        )}

        <Card className="p-6">
          <CertificationForm
            onRequestSignature={handleRequestSignature}
            onMint={handleMint}
            signature={signature || undefined}
            creditId={creditId || undefined}
            connected={isConnected}
            loadingSignature={sigLoading}
            errorMessage={error || sigError || undefined}
          />
        </Card>

        {txId && (
          <Card className="p-6 mt-6">
            <h3 className="font-semibold mb-2">Transaction Submitted</h3>
            <div className="text-sm">
              <div>
                Tx Hash: <span className="font-mono">{txId}</span>
              </div>
              {mintedId && (
                <div className="mt-1">
                  Credit ID: <span className="font-mono">{mintedId}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}

export default function MintPage() {
  return (
    <WalletProvider>
      <InnerMintPage />
    </WalletProvider>
  )
}
