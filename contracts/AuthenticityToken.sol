// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AuthenticityToken is ERC721, VRFConsumerBaseV2, ConfirmedOwner {
    event RequestSent(uint256 requestId);
    event RequestResponse(uint256 requestId, uint256 randomWord);
    event EmitNFT(address owner, uint256 idNFT);

    struct RequestStatuts {
        bool fullfield;
        bool exist;
        uint256 randomNumber;
        string title;
        string paragraph;
        address signer;
    }

    struct MetadataNFT {
        string title;
        string paragraph;
        address signer;
    }

    mapping(uint256 => RequestStatuts) public checkRequestId;
    mapping(uint256 => MetadataNFT) public checkMetadataNFT;

    VRFCoordinatorV2Interface COORDINATOR;

    uint64 private subscriptionId;

    uint256[] public allRequestId;
    uint256 public lastRequestId;
    uint256[] public issuedNFTs;

    bytes32 private keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    uint32 private callbackGasLimit = 1000000;

    uint16 private requestConfirmations = 3;

    uint32 private numWords = 1;

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

        checkRequestId[requestId] = RequestStatuts({
            fullfield: false,
            exist: true,
            randomNumber: 0,
            title: _title,
            paragraph: _paragraph,
            signer: msg.sender
        });

        lastRequestId = requestId;
        allRequestId.push(requestId);
        emit RequestSent(requestId);
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
        checkMetadataNFT[_randomWord[0]] = MetadataNFT({
            title: checkRequestId[_requestId].title,
            paragraph: checkRequestId[_requestId].paragraph,
            signer: checkRequestId[_requestId].signer
        });
        issuedNFTs.push(_randomWord[0]);
        emit RequestResponse(_requestId, _randomWord[0]);
        emit EmitNFT(msg.sender, _randomWord[0]);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (RequestStatuts memory) {
        require(checkRequestId[_requestId].exist, "Request doesn't found");
        RequestStatuts memory result = checkRequestId[_requestId];
        return result;
    }
}
