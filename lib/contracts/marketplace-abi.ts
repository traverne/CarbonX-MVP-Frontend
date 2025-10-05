export const marketplaceAbi = [
  {
    type: "function",
    name: "list",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "expiry", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [{ name: "listingId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getListing",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [
      {
        name: "listing",
        type: "tuple",
        components: [
          { name: "asker", type: "address" },
          { name: "bidder", type: "address" },
          { name: "id", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "fulfilledAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "fulfill",
    inputs: [{ name: "listingId", type: "uint256" }],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "payable",
  },
] as const
