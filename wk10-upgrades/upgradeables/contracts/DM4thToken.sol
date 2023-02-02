//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

abstract contract DM4thToken is ERC20, Ownable {

    using SafeMath for uint256;
    using Address for address;

    address public _minter;

    uint256 public constant maxSupply = 1000000 * 1 ether;

    // Buy & Sell ratios to ETH
    uint256 private constant buy_ratio = 10000;
    uint256 private constant sell_ratio = 20000;

    // Add events for off-chain applications
    event ChangeMinter(address _newMinter);

    event MintTokensToAddress(address _recipient, uint256 _amount);
    event BurnTokensFromAddress(address _target, uint256 _amount);

    event BuyTokens();
    event Withdraw(uint256 _amountEth);

    event SellBack(uint256 _amount);

    // No need for constructor as we are using this with a proxy contract
    // constructor() ERC20("DM4th", "DM4") {
    //     _minter = address(0);
    // }

    function mintTokensToAddress(address recipient, uint256 amount) public virtual {
        // Check that the caller is teh owner
        require(msg.sender == owner() || msg.sender == _minter, "You do not have the power!!");
        // check that this mint won't put the total supply > 1,000,000
        require(totalSupply() <= maxSupply - amount, "Mint will overflow the token limit");
        // mint new tokens to the "to" address -- exception handling done in ERC20
        _mint(recipient, amount);  
        emit MintTokensToAddress(recipient, amount);
    }

    function burnTokensFromAddress(address target, uint256 amount) public virtual {
        // Check that the caller is God
        require(msg.sender == owner() || msg.sender == _minter, "You do not have the power!!");
        // burn tokens from the "to" address -- exception handling done in ERC20
        _burn(target, amount);
        emit BurnTokensFromAddress(target, amount);     
    }

    function changeMinter(address newMinter) public virtual onlyOwner{
        require(newMinter.isContract() || newMinter == address(0), "New Minter Address must be another contract!!");
        _minter = newMinter;

        emit ChangeMinter(newMinter);
    }

    /**
     * Token Sale
     * 
     * add functionality for a user to mint 10000 tokens if they pay 1 ETH
     * 
     * - Cannot make the token supply go over 1,000,000
     * - Make sure to include a function to withdraw the Ether that other users pay into it
     */

    function buyTokens() public payable {
        // check that sender is sending 1 ETH
        require(msg.value > 0 ether, "Must send more than 0 ETH!!");
        uint256 mint_amount = msg.value * buy_ratio ;
        // check that this mint won't put the total supply > 1,000,000
        require(totalSupply() <= maxSupply - mint_amount, "Mint will overflow the 1,000,000 token limit");

        _mint(msg.sender, mint_amount);

        emit BuyTokens();
    }

    function withdraw (uint256 amountEth)  public {
        // check that the message sender is god
        require(msg.sender == owner(), "You do not have the power!!");
        // check that the withdrawal amount is not greater than the smart contract's balance
        uint256 amountWei = amountEth * 1 ether;
        payable(msg.sender).transfer(amountWei);

        emit Withdraw(amountEth);
    }

    /**
     * Partial Refund
     * 
     * add functionality for a user to redeem 1000 tokens for 0.5ETH
     * 
     * - Any arbitrary amount of tokens should work and hold the same ratio of 1000 tokens / 0.5 ETH
     * - Revert if the contract doesn't have enough ETH to pay the user
     * - Hard supply max at 1,000,000 tokens still holds
     * - Users minting tokens at the supply limit can redeem from the contract's balance of tokens if available
     * - SafeMath from OpenZepplin imported to handle integer division
     */

    function sellBack(uint256 amount) public {
        // check that amount > 0
        require(amount > 0, "Input amount to sellBack == 0??!!");
        uint256 refund_wei = amount * 1 ether / sell_ratio; 
        // check that contract has enough ETH 
        require(address(this).balance >= refund_wei, "Smart contract is too poor for a refund!!");
        // check contract allowance to spend tokens
        // uint256 token_allowance = allowance(msg.sender, address(this));
        // require(token_allowance >= amount, "Not enough allowance to perform transfer!!");
        // require contract approval to move ERC-20 tokens -- happens outside contract don't need
        // bool approval = approve(address(this), amount);
        // require(approval, "Transaction approval denied!!");
        
        // transfer the tokens first
        _transfer(msg.sender, address(this), amount * 1 ether);

        // transfer the eth
        payable(msg.sender).transfer(refund_wei);

        emit SellBack(amount);
    }
}