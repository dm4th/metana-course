// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./ForgeToken.sol";

// Author: @dm4th
contract ForgeLogicAttack is Ownable {
    using SafeMath for uint256;
    using Address for address;

    // initialize variables for the ERC20 and ERC721 contract deployments
    ForgeToken private ft;
    uint256 private _ZERO;
    uint256 private _ONE;
    uint256 private _TWO;
    uint256 private _THREE;
    uint256 private _FOUR;
    uint256 private _FIVE;
    uint256 private _SIX;

    // initialize wait timers for token minting ( token ID => user address => block time of mint )
    mapping(uint256 => mapping(address => uint256)) private _withdrawalTimes;
    uint256 public constant WITHDRAWAL_WAIT = 60;

    uint256 public constant tokenAmount = 1;

    constructor(address _tokenContract) {
        require(_tokenContract.isContract(), "Token Contract argument must be a deployed contract!!");
        ft = ForgeToken(_tokenContract);

        // verify that the deployer of this contract and the owner of the token contract are the same
        require(ft.owner() == owner(), "The owner of the ERC1155 token contract must be the same as this contract!!");

        _ZERO = ft.ZERO();
        _ONE = ft.ONE();
        _TWO = ft.TWO();
        _THREE = ft.THREE();
        _FOUR = ft.FOUR();
        _FIVE = ft.FIVE();
        _SIX = ft.SIX();
    }

    /**
     * @dev Function to try to mint tokens that shouldn't be possible on the contract
     * 
     * @param id - token id to mint
     */
    function mintAttack(uint256 id) public virtual {
        ft.mint(msg.sender, id, tokenAmount);
    }
}