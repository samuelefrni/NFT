import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("VRFCoordinatorV2Mock", () => {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();

    const _baseFee = ethers.parseEther("0.1");
    const _GASPRICELINK = 1000000000;
    const VRFCoordinatorV2Mock = await ethers.deployContract(
      "VRFCoordinatorV2Mock",
      [_baseFee, _GASPRICELINK]
    );

    return { VRFCoordinatorV2Mock };
  }
  describe("Testing VRF functions", () => {
    it("Should generate the request id", async () => {
      const { VRFCoordinatorV2Mock } = await loadFixture(deploy);

      const contractMockAddress = await VRFCoordinatorV2Mock.getAddress();
      const KEYHASH_TESTING =
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";

      await VRFCoordinatorV2Mock.createSubscription();
      const _subId = await VRFCoordinatorV2Mock.s_currentSubId();
      await VRFCoordinatorV2Mock.fundSubscription("1", ethers.parseEther("1"));

      const AuthenticityTokenTesting = await ethers.deployContract(
        "AuthenticityTokenTesting",
        [_subId, contractMockAddress, KEYHASH_TESTING]
      );

      const contractCounsumerAddress =
        await AuthenticityTokenTesting.getAddress();

      await VRFCoordinatorV2Mock.addConsumer(_subId, contractCounsumerAddress);

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "La capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        1,
        contractCounsumerAddress
      );

      expect(await AuthenticityTokenTesting.lastRequestId()).to.equal(1);
    });
  });
});
