import { ethers } from "hardhat";

async function main() {
  const subscriptionId = 9720;
  const [owner] = await ethers.getSigners();
  const AuthenticityToken = await ethers.deployContract("AuthenticityToken", [
    subscriptionId,
  ]);

  AuthenticityToken.waitForDeployment();

  console.log(`Deployed with: ${owner.address}`);
  console.log(`Deployed at: ${await AuthenticityToken.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
