import { getConnex } from "./setup"

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function waitForTransaction(txId: string): Promise<any> {
  const connex = await getConnex()
  const deadline = Date.now() + 90_000 // 90s timeout
  while (Date.now() < deadline) {
    const receipt = await connex.thor.transaction(txId).getReceipt()
    if (receipt) return receipt
    await sleep(1500)
  }
  throw new Error("Transaction timeout")
}
