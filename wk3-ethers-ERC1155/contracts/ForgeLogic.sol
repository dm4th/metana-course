// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./ForgeToken.sol";

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
    uint256 private WITHDRAWAL_WAIT = 60;

    uint256 tokenAmount = 1;

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
     * @param recipient - address to mint tokens to
     * @param id - token id to mint
     */
    function mintStarter(address recipient, uint256 id) public virtual returns(bool) {
        // check that the input id is between 0 and 2
        require(id == _ZERO || id == _ONE || id == _TWO, "Wrong input ID to function mintStarter!!");
        // check the cooldown timer
        require(block.timestamp - _withdrawalTimes[id][recipient] > WITHDRAWAL_WAIT, "Need to wait for token cooldown!!");

        // mint token of specific ID to recipient
        ft.mint(recipient, id, tokenAmount);
        // reset mint timer
        _withdrawalTimes[id][recipient] = block.timestamp;

        return true;
    }

    /**
     * @dev Function to mint token IDs 0 thru 2 with relevant checks
     * 
     * @param recipient - address transferring tokens
     * @param from_id - token id to burn
     * @param from_id - token id to mint
     */
    function transferToken(address recipient, uint256 from_id, uint256 to_id) public virtual returns(bool) {
        // check that the input id and output id are not the same
        require(from_id != to_id, "Why are you trading a token for itself??!!");
        // check that the output id is between 0 and 2
        require(to_id == _ZERO || to_id == _ONE || to_id == _TWO, "Can only trade for start tokens!!");

        // burn token of from ID from recipient
        ft.burn(recipient, from_id, tokenAmount);
        // mint token of to ID to recipient
        ft.mint(recipient, to_id, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 3 with relevant checks
     * 
     * @param recipient - address to mint tokens to
     */
    function mint3(address recipient) public virtual returns(bool) {
        // burn tokens 0, 1 from recipient (checks for whether they have the relevant balance)
        ft.burn(recipient, _ZERO, tokenAmount);
        ft.burn(recipient, _ONE, tokenAmount);
        // mint token 3 to recipient
        ft.mint(recipient, _THREE, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 4 with relevant checks
     * 
     * @param recipient - address to mint tokens to
     */
    function mint4(address recipient) public virtual returns(bool) {
        // burn tokens 1, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(recipient, _ONE, tokenAmount);
        ft.burn(recipient, _TWO, tokenAmount);
        // mint token 4 to recipient
        ft.mint(recipient, _FOUR, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 5 with relevant checks
     * 
     * @param recipient - address to mint tokens to
     */
    function mint5(address recipient) public virtual returns(bool) {
        // burn tokens 0, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(recipient, _ZERO, tokenAmount);
        ft.burn(recipient, _TWO, tokenAmount);
        // mint token 5 to recipient
        ft.mint(recipient, _FIVE, tokenAmount);

        return true;
    }

    /**
     * @dev Function to mint token ID 6 with relevant checks
     * 
     * @param recipient - address to mint tokens to
     */
    function mint6(address recipient) public virtual returns(bool) {
        // burn tokens 0, 1, 2 from recipient (checks for whether they have the relevant balance)
        ft.burn(recipient, _ZERO, tokenAmount);
        ft.burn(recipient, _ONE, tokenAmount);
        ft.burn(recipient, _TWO, tokenAmount);
        // mint token 6 to recipient
        ft.mint(recipient, _SIX, tokenAmount);

        return true;
    }
}