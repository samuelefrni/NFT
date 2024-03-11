// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AuthenticityTokenTesting is VRFConsumerBaseV2, ERC721 {
    VRFCoordinatorV2Interface immutable COORDINATOR;

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
        address signer;
    }

    mapping(uint256 => RequestStatus) public checkRequestId;
    mapping(uint256 => ArticleMetadataNFT) public checkMetadataNFT;

    uint256 public lastRequestId;
    uint256[] public allRequestId;
    uint256[] public allRandomWords;

    uint256[] public issuedNFTs;

    uint64 immutable s_subscriptionId;

    bytes32 immutable s_keyHash;

    uint32 constant CALLBACK_GAS_LIMIT = 300000;

    uint16 constant REQUEST_CONFIRMATIONS = 3;

    uint32 constant NUM_WORDS = 1;

    address s_owner;

    event RequestCreated(uint256 requestId);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event NFTMinted(uint256 indexed idNFT, address indexed owner);

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) VRFConsumerBaseV2(vrfCoordinator) ERC721("AuthenticityToken", "AT") {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_keyHash = keyHash;
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
    }

    function publishArticle(
        string memory _title,
        string memory _paragraph
    ) external onlyOwner {
        lastRequestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            REQUEST_CONFIRMATIONS,
            CALLBACK_GAS_LIMIT,
            NUM_WORDS
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
            signer: checkRequestId[_requestId].signer
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
        _safeMint(checkMetadataNFT[_idNFT].signer, _idNFT);
        checkMetadataNFT[_idNFT].minted = true;
        emit NFTMinted(_idNFT, checkMetadataNFT[_idNFT].signer);
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
