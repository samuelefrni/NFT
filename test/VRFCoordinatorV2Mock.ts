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

    return { owner, otherAccount, VRFCoordinatorV2Mock };
  }
  describe("Testing publishArticle functions", () => {
    it("Should generate the requestId from the publishArticle, fullFill the metadata and create the NFT tokens", async () => {
      const { owner, VRFCoordinatorV2Mock } = await loadFixture(deploy);

      const contractMockAddress = await VRFCoordinatorV2Mock.getAddress(); //@Param for testing

      await VRFCoordinatorV2Mock.createSubscription(); //Create the subscription

      const _subId = await VRFCoordinatorV2Mock.s_currentSubId(); //Get the current subscription

      //Fund the subcription
      await VRFCoordinatorV2Mock.fundSubscription(
        _subId,
        ethers.parseEther("1")
      );

      const KEYHASH_TESTING =
        "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc"; //@Param for testing

      //Deploy the consumer contract
      const AuthenticityTokenTesting = await ethers.deployContract(
        "AuthenticityTokenTesting",
        [_subId, contractMockAddress, KEYHASH_TESTING]
      );

      const contractCounsumerAddress = //@Param for constructor
        await AuthenticityTokenTesting.getAddress();

      await VRFCoordinatorV2Mock.addConsumer(_subId, contractCounsumerAddress); //Adding consumer

      //Requesting random words from consumer
      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "La capitale d'Italia"
      );

      const _requestId = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId,
        contractCounsumerAddress
      );

      //Check the request status
      expect(
        await AuthenticityTokenTesting.getRequestStatus(_requestId)
      ).to.deep.equal([
        true,
        true,
        [await AuthenticityTokenTesting.allRandomWords(0)],
        "Roma",
        "La capitale d'Italia",
        owner.address,
      ]);

      const idNFT = await AuthenticityTokenTesting.issuedNFTs(0);

      //Should return the metadata of the NFT
      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(idNFT)
      ).to.deep.equal([
        true,
        false, //Not yet minted
        "Roma",
        "La capitale d'Italia",
        owner.address,
      ]);

      //Create NFT and check metadata
      await AuthenticityTokenTesting.mintNFT(idNFT);

      expect(await AuthenticityTokenTesting.balanceOf(owner.address)).to.equal(
        1
      );

      expect(await AuthenticityTokenTesting.ownerOf(idNFT)).to.equal(
        owner.address
      );

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(idNFT)
      ).to.deep.equal([
        true,
        true, //Minted
        "Roma",
        "La capitale d'Italia",
        owner.address,
      ]);
    });
  });
});
