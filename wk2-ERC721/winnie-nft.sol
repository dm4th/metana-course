// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WinnieNFT is ERC721, Ownable {

    uint256 public tokenSupply = 0;
    uint256 public constant MAX_SUPPLY = 10;
    uint256 public constant PRICE = 0.0001 ether;

    constructor() ERC721("Winnie", "WNE") {}

    function mint() external payable {
        require(tokenSupply < MAX_SUPPLY, "Supply Used Up!!");
        require(msg.value == PRICE, "Wrong Price for Minting!!");

        _mint(msg.sender, tokenSupply);
        tokenSupply++;
    }

    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }
}