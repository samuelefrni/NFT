// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AuthenticityToken is ERC721, VRFConsumerBaseV2, ConfirmedOwner {
    VRFCoordinatorV2Interface COORDINATOR;

    struct RequestStatus {
        bool fullfield;
        bool exist;
        uint256[] randomNumber;
        string title;
        string paragraph;
        address signer;
    }

    struct ArticleMetadataNFT {
        bool fullfield;
        bool minted;
        string title;
        string paragraph;
        address owner;
        bool reward;
    }

    mapping(uint256 => RequestStatus) checkRequestId;
    mapping(uint256 => ArticleMetadataNFT) public checkMetadataNFT;

    uint256 priceNFT = 0.01 ether;

    uint256 public lastRequestId;
    uint256[] allRequestId;
    uint256[] allRandomWords;

    address[] rewardedUsers;

    uint256[] issuedNFTs;

    uint64 immutable subscriptionId;

    bytes32 immutable keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    uint32 constant callbackGasLimit = 400000;

    uint16 constant requestConfirmations = 3;

    uint32 constant numWords = 1;

    event RequestCreated(uint256 requestId);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event NFTMinted(uint256 indexed idNFT, address indexed owner);

    constructor(
        uint64 _subscriptionId
    )
        ERC721("AuthenticityToken", "AT")
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender)
    {
        subscriptionId = _subscriptionId;
        COORDINATOR = VRFCoordinatorV2Interface(
            0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        );
    }

    function publishArticle(
        string memory _title,
        string memory _paragraph
    ) external onlyOwner {
        lastRequestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        checkRequestId[lastRequestId] = RequestStatus({
            fullfield: false,
            exist: true,
            randomNumber: new uint[](0),
            title: _title,
            paragraph: _paragraph,
            signer: msg.sender
        });

        allRequestId.push(lastRequestId);
        emit RequestCreated(lastRequestId);
    }

    function createNFT(
        string memory _title,
        string memory _paragraph
    ) external payable {
        require(msg.value >= priceNFT, "Price for creating NFT: 0.01 ether");

        if (msg.value > priceNFT) {
            uint256 change = msg.value - priceNFT;
            payable(msg.sender).transfer(change);
        }

        bool isIllimitated = false;

        for (uint i = 0; i < rewardedUsers.length; i++) {
            if (rewardedUsers[i] == msg.sender) {
                isIllimitated = true;
            }
        }

        if (isIllimitated != true) {
            require(
                balanceOf(msg.sender) < 2,
                "Sender can't create more than 2 NFTs"
            );
        }

        lastRequestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        checkRequestId[lastRequestId] = RequestStatus({
            fullfield: false,
            exist: true,
            randomNumber: new uint[](0),
            title: _title,
            paragraph: _paragraph,
            signer: msg.sender
        });

        allRequestId.push(lastRequestId);
        emit RequestCreated(lastRequestId);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        allRandomWords = _randomWords;
        checkRequestId[_requestId].fullfield = true;
        checkRequestId[_requestId].randomNumber = _randomWords;
        checkMetadataNFT[_randomWords[0]] = ArticleMetadataNFT({
            fullfield: true,
            minted: false,
            title: checkRequestId[_requestId].title,
            paragraph: checkRequestId[_requestId].paragraph,
            owner: checkRequestId[_requestId].signer,
            reward: false
        });
        issuedNFTs.push(_randomWords[0]);
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (RequestStatus memory) {
        require(
            checkRequestId[_requestId].exist,
            "Id of the request doesn't found"
        );
        RequestStatus memory result = checkRequestId[_requestId];
        return result;
    }

    function mintNFT(uint256 _idNFT) external {
        require(
            checkMetadataNFT[_idNFT].fullfield,
            "Id of the NFT doesn't found"
        );

        _safeMint(checkMetadataNFT[_idNFT].owner, _idNFT);
        checkMetadataNFT[_idNFT].minted = true;

        bool hasReceivedReward = false;

        for (uint i = 0; i < rewardedUsers.length; i++) {
            if (rewardedUsers[i] == msg.sender) {
                hasReceivedReward = true;
            }
        }

        if (issuedNFTs.length % 50 == 0 && hasReceivedReward == false) {
            checkMetadataNFT[_idNFT].reward = true;
        } else {
            checkMetadataNFT[_idNFT].reward = false;
        }

        emit NFTMinted(_idNFT, checkMetadataNFT[_idNFT].owner);
    }

    function getReward(uint256 _idNFT) external {
        require(ownerOf(_idNFT) == msg.sender, "You doesn't hold this NFT");
        if (checkMetadataNFT[_idNFT].reward == true) {
            checkMetadataNFT[_idNFT].reward = false;
            rewardedUsers.push(msg.sender);
        } else {
            revert("The reward of this NFT is already taken ");
        }
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) public override {
        super.transferFrom(_from, _to, _tokenId);
        checkMetadataNFT[_tokenId].owner = _to;
    }
}
