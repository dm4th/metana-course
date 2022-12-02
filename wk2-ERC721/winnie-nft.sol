// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WinnieNFT is ERC721, Ownable {

    uint256 public tokenSupply = 0;
    uint256 public constant MAX_SUPPLY = 10;
    // make the price to mint 0 - minting will be done with an ERC20
    uint256 public constant PRICE = 0 ether;

    constructor() ERC721("Winnie", "WNE") {}

    function mint() external payable returns (uint256) {
        // check that we haven't exceeded the max number of tokens and that we're paying the right amount for the token
        require(tokenSupply < MAX_SUPPLY, "Supply Used Up!!");
        require(msg.value == PRICE, "Wrong Price for Minting!!");

        // use the built-in ERC721 mint function
        _mint(msg.sender, tokenSupply);
        // increment the total supply counter
        tokenSupply++;
        // NEW CHANGE
        // return the tokenID that was just minted (totalSupply -1)
        return tokenSupply - 1;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }
}