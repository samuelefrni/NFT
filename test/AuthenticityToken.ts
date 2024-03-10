import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AuthenticityToken", () => {
  async function deploy() {
    const subscriptionId = 9720;
    const [owner, otherAccount] = await ethers.getSigners();
    const AuthenticityToken = await ethers.deployContract("AuthenticityToken", [
      subscriptionId,
    ]);
    return { subscriptionId, owner, otherAccount, AuthenticityToken };
  }
  describe("General testing for deployment", () => {
    it("Should return the corret info about the ERC721 token", async () => {
      const { AuthenticityToken } = await loadFixture(deploy);

      expect(await AuthenticityToken.name()).to.equal("AuthenticityToken");
      expect(await AuthenticityToken.symbol()).to.equal("AT");
    });
  });
});
