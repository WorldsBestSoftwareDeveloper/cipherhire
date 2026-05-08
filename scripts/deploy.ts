import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n🔐 CipherHire — Deploying to", (await ethers.provider.getNetwork()).name);
  console.log("📬 Deployer:", deployer.address);
  console.log(
    "💰 Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH\n"
  );

  // 1. Deploy TaskManager
  console.log("1️⃣  Deploying TaskManager...");
  const TaskManager = await ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();
  await taskManager.waitForDeployment();
  const taskManagerAddr = await taskManager.getAddress();
  console.log("   ✅ TaskManager:", taskManagerAddr);

  // 2. Deploy BidManager (needs TaskManager address)
  console.log("2️⃣  Deploying BidManager...");
  const BidManager = await ethers.getContractFactory("BidManager");
  const bidManager = await BidManager.deploy(taskManagerAddr);
  await bidManager.waitForDeployment();
  const bidManagerAddr = await bidManager.getAddress();
  console.log("   ✅ BidManager:", bidManagerAddr);

  // 3. Deploy MatchingEngine (needs both)
  console.log("3️⃣  Deploying MatchingEngine...");
  const MatchingEngine = await ethers.getContractFactory("MatchingEngine");
  const matchingEngine = await MatchingEngine.deploy(taskManagerAddr, bidManagerAddr);
  await matchingEngine.waitForDeployment();
  const matchingEngineAddr = await matchingEngine.getAddress();
  console.log("   ✅ MatchingEngine:", matchingEngineAddr);

  // 4. Wire up BidManager → MatchingEngine
  console.log("4️⃣  Wiring contracts...");
  const tx = await bidManager.setMatchingEngine(matchingEngineAddr);
  await tx.wait();
  console.log("   ✅ BidManager.matchingEngine set\n");

  // 5. Save addresses to JSON (for frontend)
  const addresses = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    taskManager: taskManagerAddr,
    bidManager: bidManagerAddr,
    matchingEngine: matchingEngineAddr,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputPath = path.join(__dirname, "../frontend/src/lib/contracts.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));

  console.log("📄 Contract addresses saved to frontend/src/lib/contracts.json");
  console.log("\n🎉 Deployment complete!\n");
  console.log("Contract addresses:");
  console.log(JSON.stringify(addresses, null, 2));

  // 6. Print verification commands
  console.log("\n🔍 To verify on Etherscan, run:");
  console.log(`npx hardhat verify --network sepolia ${taskManagerAddr}`);
  console.log(`npx hardhat verify --network sepolia ${bidManagerAddr} "${taskManagerAddr}"`);
  console.log(
    `npx hardhat verify --network sepolia ${matchingEngineAddr} "${taskManagerAddr}" "${bidManagerAddr}"`
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
