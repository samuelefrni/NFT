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
    it("Should generate the requestId from the publishArticle, fullFill the metadata and mint the NFT token", async () => {
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
        false,
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
        false,
      ]);
    });
  });
  describe("Testing createNFT function", () => {
    it("Should mint the new NFT created by the user and check the metadata", async () => {
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

      await AuthenticityTokenTesting.createNFT(
        "Palermo",
        "Capoluogo della Sicilia",
        { value: ethers.parseEther("0.01") }
      );

      const _requestId = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId,
        contractCounsumerAddress
      );

      const idNFT = await AuthenticityTokenTesting.issuedNFTs(0);

      expect(
        await AuthenticityTokenTesting.getRequestStatus(_requestId)
      ).to.deep.equal([
        true,
        true,
        [idNFT],
        "Palermo",
        "Capoluogo della Sicilia",
        owner.address,
      ]);

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(idNFT)
      ).to.deep.equal([
        true,
        false,
        "Palermo",
        "Capoluogo della Sicilia",
        owner.address,
        false,
      ]);

      await AuthenticityTokenTesting.mintNFT(idNFT);

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(idNFT)
      ).to.deep.equal([
        true,
        true,
        "Palermo",
        "Capoluogo della Sicilia",
        owner.address,
        false,
      ]);
    });
    it("Should revert if the user try to hold more than 2 NFTs", async () => {
      const { VRFCoordinatorV2Mock } = await loadFixture(deploy);

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

      await AuthenticityTokenTesting.createNFT(
        "Palermo",
        "Capoluogo della Sicilia",
        { value: ethers.parseEther("2") }
      );

      const _requestId = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.createNFT(
        "Messina",
        "Provincia della Sicilia",
        { value: ethers.parseEther("1") }
      );

      const _requestId2 = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId2,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(1)
      );

      await expect(
        AuthenticityTokenTesting.createNFT(
          "Catania",
          "Provincia della Sicilia",
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Sender can't create more than 2 NFTs");
    });
    it("Should allow the user to hold more than 2 NFTs if he is a rewardedUsers", async () => {
      const { owner, otherAccount, VRFCoordinatorV2Mock } = await loadFixture(
        deploy
      );

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

      await AuthenticityTokenTesting.connect(owner).createNFT(
        "Palermo",
        "Capoluogo della Sicilia",
        { value: ethers.parseEther("2") }
      );

      const _requestId = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      await AuthenticityTokenTesting.connect(otherAccount).createNFT(
        "Messina",
        "Provincia della Sicilia",
        { value: ethers.parseEther("1") }
      );

      const _requestId2 = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId2,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(1)
      );

      await AuthenticityTokenTesting.connect(otherAccount).getReward(
        await AuthenticityTokenTesting.issuedNFTs(1)
      );

      await expect(
        AuthenticityTokenTesting.connect(owner).getReward(
          await AuthenticityTokenTesting.issuedNFTs(1)
        )
      ).to.be.revertedWith("You doesn't hold this NFT");

      await AuthenticityTokenTesting.connect(owner).createNFT(
        "Catania",
        "Provincia della Sicilia",
        { value: ethers.parseEther("1") }
      );

      const _requestId3 = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId3,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(2)
      );

      await expect(
        AuthenticityTokenTesting.connect(owner).createNFT(
          "Trapani",
          "Provincia della Sicilia",
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Sender can't create more than 2 NFTs");

      await AuthenticityTokenTesting.connect(otherAccount).createNFT(
        "Enna",
        "Provincia della Sicilia",
        { value: ethers.parseEther("1") }
      );

      const _requestId4 = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId4,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(3)
      );

      await AuthenticityTokenTesting.connect(otherAccount).createNFT(
        "Ragusa",
        "Provincia della Sicilia",
        { value: ethers.parseEther("1") }
      );

      const _requestId5 = await AuthenticityTokenTesting.lastRequestId(); //Get lastRequest

      //Fullfill the reuquest from VRFMock
      await VRFCoordinatorV2Mock.fulfillRandomWords(
        _requestId5,
        contractCounsumerAddress
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(4)
      );

      expect(
        await AuthenticityTokenTesting.balanceOf(otherAccount.address)
      ).to.equal(3);
      expect(await AuthenticityTokenTesting.balanceOf(owner.address)).to.equal(
        2
      );
    });
    it("Should revert if the sender doesn't have enough fund", async () => {
      const { VRFCoordinatorV2Mock } = await loadFixture(deploy);

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

      await expect(
        AuthenticityTokenTesting.createNFT(
          "Palermo",
          "Capoluogo della Sicilia",
          { value: ethers.parseEther("0.001") }
        )
      ).to.be.revertedWith("Price for creating NFT: 0.01 ether");
    });
  });
  describe("Testing mintNFT function", () => {
    it("Should revert the mintNFT function if idNFT doesn't exist", async () => {
      const { VRFCoordinatorV2Mock } = await loadFixture(deploy);

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

      await expect(AuthenticityTokenTesting.mintNFT(12345)).to.be.revertedWith(
        "Id of the NFT doesn't found"
      );
    });
    it("Should assign the reward", async () => {
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

      await VRFCoordinatorV2Mock.addConsumer(
        _subId,
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "Capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        await AuthenticityTokenTesting.lastRequestId(),
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(
          await AuthenticityTokenTesting.issuedNFTs(0)
        )
      ).to.deep.equal([
        true,
        true,
        "Roma",
        "Capitale d'Italia",
        owner.address,
        false, //Reward
      ]);

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "Capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        await AuthenticityTokenTesting.lastRequestId(),
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(1)
      );

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(
          await AuthenticityTokenTesting.issuedNFTs(1)
        )
      ).to.deep.equal([
        true,
        true,
        "Roma",
        "Capitale d'Italia",
        owner.address,
        true, //Reward
      ]);
    });
  });
  describe("Testing transferFrom function", () => {
    it("Should transfer the NFT to otherAccount", async () => {
      const { owner, otherAccount, VRFCoordinatorV2Mock } = await loadFixture(
        deploy
      );

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
        [_subId, await VRFCoordinatorV2Mock.getAddress(), KEYHASH_TESTING]
      );

      await VRFCoordinatorV2Mock.addConsumer(
        _subId,
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "La capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        await AuthenticityTokenTesting.lastRequestId(),
        AuthenticityTokenTesting
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      expect(await AuthenticityTokenTesting.balanceOf(owner)).to.equal(1);

      await AuthenticityTokenTesting.transferFrom(
        owner.address,
        otherAccount.address,
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      expect(await AuthenticityTokenTesting.balanceOf(owner)).to.equal(0);
      expect(await AuthenticityTokenTesting.balanceOf(otherAccount)).to.equal(
        1
      );
      expect(
        await AuthenticityTokenTesting.ownerOf(
          await AuthenticityTokenTesting.issuedNFTs(0)
        )
      ).to.equal(otherAccount.address);
    });
    it("Should chenge the owner metadata after the transfer of the NFT", async () => {
      const { owner, otherAccount, VRFCoordinatorV2Mock } = await loadFixture(
        deploy
      );

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
        [_subId, await VRFCoordinatorV2Mock.getAddress(), KEYHASH_TESTING]
      );

      await VRFCoordinatorV2Mock.addConsumer(
        _subId,
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "La capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        await AuthenticityTokenTesting.lastRequestId(),
        AuthenticityTokenTesting
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      expect(await AuthenticityTokenTesting.balanceOf(owner)).to.equal(1);
      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(
          await AuthenticityTokenTesting.issuedNFTs(0)
        )
      ).to.deep.equal([
        true,
        true,
        "Roma",
        "La capitale d'Italia",
        owner.address,
        false,
      ]);

      await AuthenticityTokenTesting.transferFrom(
        owner.address,
        otherAccount.address,
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      expect(await AuthenticityTokenTesting.balanceOf(owner)).to.equal(0);
      expect(await AuthenticityTokenTesting.balanceOf(otherAccount)).to.equal(
        1
      );

      expect(
        await AuthenticityTokenTesting.checkMetadataNFT(
          await AuthenticityTokenTesting.issuedNFTs(0)
        )
      ).to.deep.equal([
        true,
        true,
        "Roma",
        "La capitale d'Italia",
        otherAccount.address,
        false,
      ]);
    });
    it("Should revert if the sender doesn't hold the NFT", async () => {
      const { otherAccount, VRFCoordinatorV2Mock } = await loadFixture(deploy);

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
        [_subId, await VRFCoordinatorV2Mock.getAddress(), KEYHASH_TESTING]
      );

      await VRFCoordinatorV2Mock.addConsumer(
        _subId,
        await AuthenticityTokenTesting.getAddress()
      );

      await AuthenticityTokenTesting.publishArticle(
        "Roma",
        "La capitale d'Italia"
      );

      await VRFCoordinatorV2Mock.fulfillRandomWords(
        await AuthenticityTokenTesting.lastRequestId(),
        AuthenticityTokenTesting
      );

      await AuthenticityTokenTesting.mintNFT(
        await AuthenticityTokenTesting.issuedNFTs(0)
      );

      await expect(
        AuthenticityTokenTesting.transferFrom(
          otherAccount.address,
          otherAccount.address,
          await AuthenticityTokenTesting.issuedNFTs(0)
        )
      ).to.be.reverted;
    });
  });
});
