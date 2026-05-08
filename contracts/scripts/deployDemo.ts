import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("\n🔐 CipherHire Demo — Deploying to Sepolia");
  console.log("📬 Deployer:", deployer.address);
  console.log(
    "💰 Balance:",
    ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    ),
    "ETH\n"
  );

  console.log("Deploying CipherHireDemo...");
  const Demo = await ethers.getContractFactory("CipherHireDemo");
  const demo = await Demo.deploy();
  await demo.waitForDeployment();
  const demoAddr = await demo.getAddress();
  console.log("✅ CipherHireDemo:", demoAddr);

  // Save address for frontend
  const addresses = {
    network: "sepolia",
    chainId: 11155111,
    cipherHireDemo: demoAddr,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputPath = path.join(
    __dirname,
    "../../frontend/src/lib/demoContracts.json"
  );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));

  console.log("\n🎉 Done!");
  console.log("Address:", demoAddr);
  console.log(
    "Etherscan:",
    `https://sepolia.etherscan.io/address/${demoAddr}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});