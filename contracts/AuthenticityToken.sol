// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AuthenticityToken is ERC721, VRFConsumerBaseV2, ConfirmedOwner {
    event RequestCreated(uint256 requestId);
    event RequestFulfilled(uint256 requestId, uint256 randomWord);
    event NFTCreated(address owner, uint256 idNFT);

    struct RequestStatus {
        bool fullfield;
        bool exist;
        uint256 randomNumber;
        string title;
        string paragraph;
        address signer;
    }

    struct ArticleMetadataNFT {
        bool fullfield;
        string title;
        string paragraph;
        address signer;
    }

    mapping(uint256 => RequestStatus) checkRequestId;
    mapping(uint256 => ArticleMetadataNFT) checkMetadataNFT;

    uint256[] public allRequestId;
    uint256 public lastRequestId;

    uint256[] public issuedNFTs;

    VRFCoordinatorV2Interface COORDINATOR;

    uint64 internal subscriptionId;

    bytes32 internal keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    uint32 internal callbackGasLimit = 1000000;

    uint16 internal requestConfirmations = 3;

    uint32 internal numWords = 1;

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
    ) external onlyOwner returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        checkRequestId[requestId] = RequestStatus({
            fullfield: false,
            exist: true,
            randomNumber: 0,
            title: _title,
            paragraph: _paragraph,
            signer: msg.sender
        });

        lastRequestId = requestId;
        allRequestId.push(requestId);
        emit RequestCreated(requestId);
        return requestId;
    }

    function createNFT(
        string memory _title,
        string memory _paragraph
    ) external returns (uint256 requestId) {
        require(
            balanceOf(msg.sender) < 2,
            "User can't create more than 2 NFTs"
        );
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        checkRequestId[requestId] = RequestStatus({
            fullfield: false,
            exist: true,
            randomNumber: 0,
            title: _title,
            paragraph: _paragraph,
            signer: msg.sender
        });

        lastRequestId = requestId;
        allRequestId.push(requestId);
        emit RequestCreated(requestId);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint[] memory _randomWord
    ) internal override {
        require(checkRequestId[_requestId].exist, "Request doesn't found");

        checkRequestId[_requestId].fullfield = true;
        checkRequestId[_requestId].randomNumber = _randomWord[0];
        _safeMint(msg.sender, _randomWord[0]);
        checkMetadataNFT[_randomWord[0]] = ArticleMetadataNFT({
            fullfield: true,
            title: checkRequestId[_requestId].title,
            paragraph: checkRequestId[_requestId].paragraph,
            signer: checkRequestId[_requestId].signer
        });
        issuedNFTs.push(_randomWord[0]);
        emit RequestFulfilled(_requestId, _randomWord[0]);
        emit NFTCreated(msg.sender, _randomWord[0]);
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

    function getMetadataNFT(
        uint256 _idNFT
    ) external view returns (ArticleMetadataNFT memory) {
        require(
            checkMetadataNFT[_idNFT].fullfield,
            "Id of the NFT doesn't found"
        );
        ArticleMetadataNFT memory result = checkMetadataNFT[_idNFT];
        return result;
    }
}
