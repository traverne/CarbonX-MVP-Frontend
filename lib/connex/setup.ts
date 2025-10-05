export const NETWORK = {
  testnet: {
    node: "https://testnet.vechain.org",
    network: "test" as const,
  },
  mainnet: {
    node: "https://mainnet.vechain.org",
    network: "main" as const,
  },
}

let _connex: any | null = null

export async function getConnex(network: "testnet" | "mainnet" = "testnet") {
  if (typeof window === "undefined") {
    throw new Error("Connex is only available in the browser")
  }
  if (_connex) return _connex
  const { default: Connex } = await import("@vechain/connex")
  _connex = new Connex({
    node: NETWORK[network].node,
    network: NETWORK[network].network,
  })
  return _connex
}
