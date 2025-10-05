import { ethers } from "ethers"

export function getCreditId(
  certification: {
    project_name: string
    issuer_name: string
    location: string
    methodology: string
    amount: number
    vintage_year: number
    expiry: number
    standard: number
  },
  salt: string,
): string {
  const certHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(string,string,string,string,uint256,uint256,uint256,uint8)"],
      [
        [
          certification.project_name,
          certification.issuer_name,
          certification.location,
          certification.methodology,
          certification.amount,
          certification.vintage_year,
          certification.expiry,
          certification.standard,
        ],
      ],
    ),
  )
  return ethers.keccak256(ethers.solidityPacked(["bytes32", "bytes32"], [certHash, salt as `0x${string}`]))
}

export function normalizeToHexBytes(input: string): `0x${string}` {
  if (typeof input !== "string") throw new Error("Expected string")
  return (input.startsWith("0x") ? input : ethers.hexlify(ethers.toUtf8Bytes(input))) as `0x${string}`
}

export function generateDigest(
  registrarAddress: string,
  chainId: number,
  creditId: string,
  validationProof: string,
): string {
  const PREFIX = "0x19"
  const VERSION = "0x00"
  const CREDIT_ISSUING_PREFIX = "CarbonCreditRegistrar/IssueCredit"

  const proofBytes = normalizeToHexBytes(validationProof)

  const message = ethers.keccak256(
    ethers.solidityPacked(["string", "uint256", "bytes"], [CREDIT_ISSUING_PREFIX, creditId, proofBytes]),
  )

  return ethers.keccak256(
    ethers.concat([
      PREFIX,
      VERSION,
      registrarAddress as `0x${string}`,
      ethers.solidityPacked(["uint256"], [chainId]),
      message,
    ]),
  )
}
