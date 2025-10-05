export const registrarAbi = [
  {
    type: "function",
    name: "issue",
    inputs: [
      {
        name: "certification",
        type: "tuple",
        components: [
          { name: "project_name", type: "string" },
          { name: "issuer_name", type: "string" },
          { name: "location", type: "string" },
          { name: "methodology", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "vintage_year", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "standard", type: "uint8" },
        ],
      },
      { name: "recipient", type: "address" },
      { name: "salt", type: "bytes32" },
      { name: "validationProof", type: "bytes" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [{ name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getMetadata",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      {
        name: "metadata",
        type: "tuple",
        components: [
          {
            name: "certification",
            type: "tuple",
            components: [
              { name: "project_name", type: "string" },
              { name: "issuer_name", type: "string" },
              { name: "location", type: "string" },
              { name: "methodology", type: "string" },
              { name: "amount", type: "uint256" },
              { name: "vintage_year", type: "uint256" },
              { name: "expiry", type: "uint256" },
              { name: "standard", type: "uint8" },
            ],
          },
          { name: "salt", type: "bytes32" },
          { name: "createdAt", type: "uint256" },
          { name: "retiredAt", type: "uint256" },
          { name: "mintedBy", type: "address" },
          { name: "retiredBy", type: "address" },
          { name: "validatedBy", type: "address" },
          { name: "validationProof", type: "bytes" },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const
