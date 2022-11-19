//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DM4thToken is ERC20 {

    uint256 private initialSupply = 10000;

    // used to store god adddress for later
    address public _god;

    // create authority and sanction lists
    mapping(address => bool) public authorities;
    mapping(address => bool) public sanctioned;

    // create a variable to quickly store the amount of ether in the contract
    uint256 public ethBalance = 0;

    // Add events for off-chain applications
    event MintTokensToAddress(address _recipient, uint256 _amount);
    event BurnTokensFromAddress(address _target, uint256 _amount);
    event ChangeBalanceAtAddress(address _target, uint256 _new_balance);
    event AuthoritativeTransferFrom(address _from, address _to, uint256 _amount);
    
    event AddAuthority(address _auth);
    event RemoveAuthority(address _auth);
    event AddSanction(address _sanc);
    event RemoveSanction(address _sanc);

    event BuyTokens();
    event Withdraw(uint256 _amount);


    constructor() ERC20("DM4th", "DM4") {
        _god = msg.sender;
        _mint(_god, initialSupply);
        authorities[_god] = true;
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
        require(msg.sender == _god, "You do not have the power!!");
        // mint new tokens to the "to" address -- exception handling done in ERC20
        _mint(recipient, amount);  
        emit MintTokensToAddress(recipient, amount);
    }

    function burnTokensFromAddress(address target, uint256 amount) public virtual {
        // Check that the caller is God
        require(msg.sender == _god, "You do not have the power!!");
        // burn tokens from the "to" address -- exception handling done in ERC20
        _burn(target, amount);
        emit BurnTokensFromAddress(target, amount);     
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

        emit ChangeBalanceAtAddress(target, new_balance);
    }

    function authoritativeTransferFrom(address from, address to, uint256 amount) public virtual {
        // Check that the caller is God
        require(msg.sender == _god, "You do not have the power!!");
        // transer tokens from the "from" addressto the "to" address -- exception handling done in ERC20
        _transfer(from, to, amount);

        emit AuthoritativeTransferFrom(from, to, amount);
    }

    /**
     * Centralized Authority
     * 
     * add functionality for a centralized authority to sanction addresses 
     * and prevent them from sending or receiving tokens
     * 
     * - Centralized Authority starts as just God. Only God can remove authorities and can't remove themselves
     * - Centralized Authorities can add other centralized authorities
     * - Centralized Authorities can Add/Remove Sanctioned Addresses, God cannot be sanctioned
     * - Sanctioned addresses cannot become Authorities while sanctioned
     * 
     * - Overwrite the _beforeTokenTransfer function to check against the sanction list before all transfers
     */

    function addAuthority(address auth) public virtual {
        // check that the message sender is a verified authority
        require(authorities[msg.sender] == true, "Must become an authority before performing this action!!");
        // check that the new address isn't sanctioned --> still works because all keys exist as false before initialized
        require(sanctioned[auth] == false, "Cannot make a sanctioned address an authority!!");
        // add the new address as an authority
        authorities[auth] = true;
        emit AddAuthority(auth);
    }

    function removeAuthority(address auth) public virtual {
        // check that the message sender is god
        require(msg.sender == _god, "You do not have the power!!");
        // check that the removal auth is not god
        require(auth != _god, "Cannot remove god as an authority!!");
        // add address to authority mapping as false --> handles situations where the authority isn't in the mapping yet
        authorities[auth] = false;
        emit RemoveAuthority(auth);
    }

    function addSanction(address sanc) public virtual {
        // check that the message sender is a verified authority
        require(authorities[msg.sender] == true, "Must become an authority before performing this action");
        // check that the added sanc is not god
        require(sanc != _god, "Cannot sanction god!!");
        // add the new address as an authority
        sanctioned[sanc] = true;
        // make sure the address is also no longer an authority
        authorities[sanc] = false;
        emit AddSanction(sanc);
    }

    function removeSanction(address sanc) public virtual {
        // check that the message sender is a verified authority
        require(authorities[msg.sender] == true, "Must become an authority before performing this action");
        // map the new address to false in the sanction mapping
        sanctioned[sanc] = false;
        emit RemoveSanction(sanc);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        require(sanctioned[to] == false, "VIOLATION!! Cannot transfer to a sanctioned address!");
    }

    /**
     * Token Sale
     * 
     * add functionality for a user to mint 1000 tokens if they pay 1 ETH
     * 
     * - Cannot make the token supply go over 1,000,000
     * - Make sure to include a function to withdraw the Ether that other users pay into it
     */

    function buyTokens() public payable {
        // check that sender is sending 1 ETH
        require(msg.value == 1, "Must send exactly 1 ETH!!");
        // check that this mint won't put the total supply > 1,000,000
        require(totalSupply() <= 999000, "Mint will overflow the 1,000,000 token limit");

        _mint(msg.sender, 1000);

        emit BuyTokens();
    }

    function withdraw (uint256 amount)  public {
        // check that the message sender is god
        require(msg.sender == _god, "You do not have the power!!");
        // check that the withdrawal amount is not greater than the smart contract's balance
        require(address(this).balance >= amount, "Smart contract can't afford that withdrawal!!");

        payable(msg.sender).transfer(amount);

        emit Withdraw(amount);
    }
}