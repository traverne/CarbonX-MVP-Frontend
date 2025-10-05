import { type NextRequest, NextResponse } from "next/server"
import { generateDigest, getCreditId, normalizeToHexBytes } from "@/lib/signature/helpers"
import { REGISTRAR_ADDRESS, CHAIN_ID } from "@/lib/utils/constants"
import { ethers } from "ethers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { certification, salt, validationProof } = body as {
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
    }

    // Basic input validation
    if (!certification || !salt || !validationProof) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 })
    }

    const creditId = getCreditId(certification, salt)
    const normalizedProof = normalizeToHexBytes(validationProof)
    const digest = generateDigest(REGISTRAR_ADDRESS, CHAIN_ID, creditId, normalizedProof)

    const pk = process.env.VALIDATOR_PRIVATE_KEY
    if (!pk) {
      return NextResponse.json({ success: false, error: "Validator key not configured" }, { status: 500 })
    }

    const wallet = new ethers.Wallet(pk)
    const signature = await wallet.signMessage(ethers.getBytes(digest))

    // Persist last salt in a cookie to allow the client to reuse when sending the tx
    const res = NextResponse.json({
      success: true,
      signature,
      creditId,
      validatedBy: wallet.address,
      salt,
      validationProof: normalizedProof,
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "Signature request failed" }, { status: 500 })
  }
}
