//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DM4thToken is ERC20 {

    // used to store god adddress for later
    address public _god;

    uint256 private initialSupply = 10000;
    
    constructor() ERC20("DM4th", "DM4") {
        _god = msg.sender;
        _mint(_god, initialSupply);
    }

    /**
     * God - Mode
     * 
     * mintTokensToAddress creates new tokens and sends them to an address
     * changeBalanceAtAddress changes the balance at a given address and for the total supply
     * authoritativeTransferFrom forces a trasfer between addresses
     */

    function mintTokensToAddress(address recipient, uint256 amount) public virtual {
        // Check that the caller is God

        // console.log(
        //     "Minting Tokens with sender addr: %s and _god: %s",
        //     msg.sender,
        //     _god
        // );

        require(msg.sender == _god, "You do not have the power!!");
        // mint new tokens to the "to" address -- exception handling done in ERC20
        _mint(recipient, amount);        
    }

    function burnTokensFromAddress(address target, uint256 amount) public virtual {
        // Check that the caller is God
        require(msg.sender == _god, "You do not have the power!!");
        // burn tokens from the "to" address -- exception handling done in ERC20
        _burn(target, amount);        
    }

    function changeBalanceAtAddress(address target, uint256 new_balance) public virtual {
        // get the account's current balance, the difference to the new amount, and whether or not we need to mint or bunr to get there
        uint256 curr_balance = balanceOf(target);
        
        // check that the amount to change balance is not 0
        require(new_balance != curr_balance, "No need to change balances - Already at that value");
        
        if (curr_balance < new_balance) {
            // mint
            mintTokensToAddress(target, new_balance - curr_balance);
        } else {
            // burn
            burnTokensFromAddress(target, curr_balance - new_balance);
        }    
    }

    function authoritativeTransferFrom(address from, address to, uint256 amount) public virtual {
        // Check that the caller is God
        require(msg.sender == _god, "You do not have the power!!");
        // transer tokens from the "from" addressto the "to" address -- exception handling done in ERC20
        _transfer(from, to, amount);
    }
}