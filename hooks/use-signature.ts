"use client"

import { useState } from "react"

export function useSignature() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [creditId, setCreditId] = useState<string | null>(null)
  const [salt, setSalt] = useState<string | null>(null)

  const requestValidatorSignature = async (payload: {
    certification: {
      project_name: string
      issuer_name: string
      location: string
      methodology: string
      amount: number
      vintage_year: number
      expiry: number
      standard: number
    }
    salt: string
    validationProof: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      // expose salt globally for the mint step (see comment in mint page)
      ;(window as any).__carbonxLastSalt = payload.salt

      const res = await fetch("/api/signature/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to get signature")
      }
      setSignature(data.signature)
      setCreditId(data.creditId)
      setSalt(data.salt)
      return data
    } catch (e: any) {
      setError(e?.message ?? "Failed to get signature")
      throw e
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setLoading(false)
    setError(null)
    setSignature(null)
    setCreditId(null)
    setSalt(null)
  }

  return { loading, error, signature, creditId, salt, requestValidatorSignature, reset }
}
