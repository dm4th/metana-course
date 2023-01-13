// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./ForgeToken.sol";

// Author: @dm4th
contract ForgeLogic is Ownable {
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
     * @dev Function to mint token IDs 0 thru 2 with relevant checks
     * 
     * @param id - token id to mint
     */
    function mintStarter(uint256 id) public virtual returns(bool) {
        // check that the input id is between 0 and 2
        require(id == _ZERO || id == _ONE || id == _TWO, "Wrong input ID to function mintStarter!!");
        // check the cooldown timer
        require(
            block.timestamp - _withdrawalTimes[id][msg.sender] > WITHDRAWAL_WAIT
            , "Need to wait for token cooldown!!");

        // mint token of specific ID to recipient
        ft.mint(msg.sender, id, tokenAmount);
        // reset mint timer
        _withdrawalTimes[id][msg.sender] = block.timestamp;

        return true;
    }

    /**
     * @dev Function to burn token IDs 0 thru 2 with relevant checks
     * 
     * @param id - token id to burn
     */
    function burnToken(uint256 id) public virtual returns(bool) {

        // burn token of ID from arsonist
        ft.burn(msg.sender, id, tokenAmount);

        return true;
    }

    /**
     * @dev Function to convert a token of any value back into a starter token (id 0, 1, or 2)
     * 
     * @param from_id - token id to burn
     * @param to_id - token id to mint
     */
    function transferToken(uint256 from_id, uint256 to_id) public virtual returns(bool) {
        // check that the input id and output id are not the same
        require(from_id != to_id, "Why are you trading a token for itself??!!");
        // check that the output id is between 0 and 2
        require(to_id == _ZERO || to_id == _ONE || to_id == _TWO, "Can only trade for starter tokens!!");

        // burn token of from ID from recipient
        ft.burn(msg.sender, from_id, tokenAmount);
        // mint token of to ID to recipient
        ft.mint(msg.sender, to_id, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 3 with relevant checks
     */
    function mint3() public virtual returns(bool) {
        // burn tokens 0, 1 from recipient (checks for whether they have the relevant balance)
        ft.burn(msg.sender, _ZERO, tokenAmount);
        ft.burn(msg.sender, _ONE, tokenAmount);
        // mint token 3 to recipient
        ft.mint(msg.sender, _THREE, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 4 with relevant checks
     */
    function mint4() public virtual returns(bool) {
        // burn tokens 1, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(msg.sender, _ONE, tokenAmount);
        ft.burn(msg.sender, _TWO, tokenAmount);
        // mint token 4 to recipient
        ft.mint(msg.sender, _FOUR, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 5 with relevant checks
     */
    function mint5() public virtual returns(bool) {
        // burn tokens 0, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(msg.sender, _ZERO, tokenAmount);
        ft.burn(msg.sender, _TWO, tokenAmount);
        // mint token 5 to recipient
        ft.mint(msg.sender, _FIVE, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 6 with relevant checks
     */
    function mint6() public virtual returns(bool) {
        // burn tokens 0, 1, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(msg.sender, _ZERO, tokenAmount);
        ft.burn(msg.sender, _ONE, tokenAmount);
        ft.burn(msg.sender, _TWO, tokenAmount);
        // mint token 6 to recipient
        ft.mint(msg.sender, _SIX, tokenAmount);

        return true;
    }
}