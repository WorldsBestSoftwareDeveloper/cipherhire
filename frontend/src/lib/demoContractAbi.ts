export const DEMO_CONTRACT_ADDRESS = "0x8f6551171C0D4c6Dd56D99333445805CBd84C647";

export const CIPHER_HIRE_DEMO_ABI = [
  {
    name: "createTask",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "budget", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "submitBid",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "taskId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "deliveryDays", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "runMatching",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getTask",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "bidCount", type: "uint256" },
          { name: "winner", type: "address" },
          { name: "winningBid", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "taskCounter",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getTaskBidders",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "taskId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
  },
  {
    name: "TaskCreated",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "title", type: "string", indexed: false },
      { name: "category", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "BidSubmitted",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "deliveryDays", type: "uint256", indexed: false },
    ],
  },
  {
    name: "WinnerSelected",
    type: "event",
    inputs: [
      { name: "taskId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "winningBid", type: "uint256", indexed: false },
    ],
  },
] as const;