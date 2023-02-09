// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract ForgeWallet {
    uint256 constant chainId = 5;   // Goerli Chain ID

    struct EIP712Domain {
        string  name;
        string  version;
        uint256 chainId;
        address verifyingContract;
    }

    struct mintStarterTokens {
        uint256 tokenId;
    }

    struct transferTokens {
        uint256 fromId;
        uint256 toId;
    }
}