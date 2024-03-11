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
        address signer;
    }

    mapping(uint256 => RequestStatus) public checkRequestId;
    mapping(uint256 => ArticleMetadataNFT) public checkMetadataNFT;

    uint256 public lastRequestId;
    uint256[] public allRequestId;
    uint256[] public allRandomWords;

    uint256[] public issuedNFTs;

    uint64 immutable subscriptionId;

    bytes32 immutable keyHash =
        0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    uint32 constant callbackGasLimit = 300000;

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

    // function createNFT(
    //     string memory _title,
    //     string memory _paragraph
    // ) external returns (uint256 requestId) {
    //     require(
    //         balanceOf(msg.sender) < 2,
    //         "User can't create more than 2 NFTs"
    //     );
    //     requestId = COORDINATOR.requestRandomWords(
    //         keyHash,
    //         subscriptionId,
    //         requestConfirmations,
    //         callbackGasLimit,
    //         numWords
    //     );
    //     checkRequestId[requestId] = RequestStatus({
    //         fullfield: false,
    //         exist: true,
    //         randomNumber: 0,
    //         title: _title,
    //         paragraph: _paragraph,
    //         signer: msg.sender
    //     });

    //     lastRequestId = requestId;
    //     allRequestId.push(requestId);
    //     emit RequestCreated(requestId);
    //     return requestId;
    // }

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

    // function transferNTF(
    //     address _from,
    //     address _to,
    //     uint256 _tokenId
    // ) external payable {
    //     require(
    //         ownerOf(_tokenId) == msg.sender,
    //         "The sender doesn't hold this token"
    //     );
    //     _safeTransfer(_from, _to, _tokenId);
    // }
}
