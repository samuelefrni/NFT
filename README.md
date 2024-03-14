<div align="center"><img src="./assets/nft-technology-line-icon-non-fungible-token-symbol-vector.png" width="150px"></div>
<br />
<div align="center">
  <h1 align="center">NFT</h1>

  <p align="center">
    <br />
    <a href="https://sepolia.etherscan.io/address/0xff9c4ba6ea2cb24e125a5a8d35ae3fe4caf6412f"><strong>Contracts on the blockchain</strong></a>
    <br />
    <br />
    <a href="./assets/Progetto Ethereum Advanced di Samuele Furnari.pdf">Presentation IT</a>
  </p>
</div>

## Introduction

Welcome to the Decentralized News & Articles (DnA) project! This repository contains the implementation of a smart contract for creating and distributing exclusive editorial and digital content using Ethereum blockchain and NFTs (Non-Fungible Tokens). Through the utilization of Chainlink VRF (Verifiable Random Function) and OpenZeppelin, DnA ensures the authenticity and integrity of its content, providing users with access to verified and authentic information. DnA leverages the Ethereum blockchain to tokenize editorial and digital content, ensuring its authenticity and preventing the dissemination of false or manipulated information. Each article or video produced by DnA is represented as a unique NFT, containing information about its authenticity, metadata, and the digital signature of the author.

## About my choise

1. **AuthenticityToken.sol**: The AuthenticityTokenTesting contract forms the core of the DnA project, managing the creation, management, and authentication of NFTs for every article or video published on the platform. This contract implements the logic for generating reliable random numbers using Chainlink VRF, assigning metadata to NFTs, and checking the authenticity of the content. By leveraging Chainlink VRF, the contract ensures that the randomness used in various operations, is secure and verifiable. Additionally, AuthenticityTokenTesting handles the rewards system for users who actively contribute to the platform, incentivizing participation and engagement.
3. **Chainlink VRF Integration**: To ensure the randomness and integrity of certain operations within the platform, AuthenticityTokenTesting integrates Chainlink VRF. This integration enables the platform to generate secure and verifiable random numbers, which are crucial for functions such as content curation and reward distribution. By leveraging Chainlink VRF, the platform can guarantee that the randomness used in these operations is tamper-proof and cannot be manipulated, ensuring fairness and transparency in the platform's operations.
4. **OpenZeppelin (ERC721 Contract Integration)**: AuthenticityTokenTesting leverages OpenZeppelin libraries to integrate the ERC721 standard into its contracts. This integration enables the creation and management of NFTs (Non-Fungible Tokens) compliant with the ERC721 standard. By adhering to this standard, NFTs created by AuthenticityTokenTesting exhibit characteristics such as uniqueness, indivisibility, and interoperability with other platforms and applications that support the ERC721 standard. This ensures that NFTs created on the DnA platform can be securely owned, traded, and interacted with across various decentralized applications and marketplaces, enhancing their utility and value proposition.

## About deployment

**_Before running the "npx hardhat test" or "npx hardhat compile"_**

## Installation

To install and run this project locally, follow these steps:

1. Clone this repository: `git clone https://github.com/samuelefrni/NFT`
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Compile contracts: `npx hardhat compile`
5. Run tests: `npx hardhat test`

### Important

**_Before running the "npx hardhat test"_**

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Author

- **Samuele Furnari**
  - Email: samuelefurnari9@gmail.com
  - GitHub: [samuelefrni](https://github.com/samuelefrni)
  - LinkedIn: [Samuele Furnari](https://www.linkedin.com/in/samuele-furnari-a37567220/)
