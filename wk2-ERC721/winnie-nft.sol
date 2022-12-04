// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract WinnieNFT is ERC721, Ownable {
    using SafeMath for uint256;
    using Address for address;

    address private _minter;

    uint256 private tokenSupply = 0;
    uint256 public constant MAX_SUPPLY = 10;

    constructor() ERC721("Winnie", "WNE") {
        _minter = address(0);
    }

    function mint(address to) external {
        // check that we haven't exceeded the max number of tokens
        require(tokenSupply < MAX_SUPPLY, "Supply Used Up!!");
        // check that the caller of the contract is in fact another contract
        require(msg.sender.isContract(), "Can only mint through another contract!!");
        // check that the caller of the contract is the new minter address
        require(msg.sender == _minter, "Calling contract not set as the minter!!");

        // use the built-in ERC721 mint function - mint token directly to the minter
        _mint(to, tokenSupply);
        // increment the total supply counter
        tokenSupply++;
    }

    function changeMinter(address newMinter) public virtual onlyOwner{
        require(newMinter.isContract(), "New Minter Address must be another contract!!");
        _minter = newMinter;
    }

    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }
}