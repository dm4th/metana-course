// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Author: @dm4th
contract ForgeToken is ERC1155, Ownable {
    using SafeMath for uint256;
    using Address for address;

    uint256 public constant ZERO = 0;
    uint256 public constant ONE = 1;
    uint256 public constant TWO = 2;
    uint256 public constant THREE = 3;
    uint256 public constant FOUR = 4;
    uint256 public constant FIVE = 5;
    uint256 public constant SIX = 6;

    address public _minter;

    constructor() ERC1155("") {
        _minter = address(0);
    }

    function mint(address to, uint256 id, uint256 amount) external {
        // check that the caller of the contract is in fact another contract
        require(msg.sender.isContract(), "Can only mint through another contract!!");
        // check that the caller of the contract is the new minter address
        require(msg.sender == _minter, "Calling contract not set as the minter!!");
        // check that the _minter is not the 0 address
        require(_minter != address(0), "Minter still set to 0 address");

        _mint(to, id, amount, "");
    }

    function burn(address from, uint256 id, uint256 amount) external {
        // check that the caller of the contract is in fact another contract
        require(msg.sender.isContract(), "Can only burn through another contract!!");
        // check that the caller of the contract is the new minter address
        require(msg.sender == _minter, "Calling contract not set as the burner!!");
        // check that the _minter is not the 0 address
        require(_minter != address(0), "burner still set to 0 address");

        _burn(from, id, amount);
    }

    function changeMinter(address newMinter) public virtual onlyOwner{
        require(newMinter.isContract(), "New Minter Address must be another contract!!");
        _minter = newMinter;
    }
}