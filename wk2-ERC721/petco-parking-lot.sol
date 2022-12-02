// SPDX-License-Identifier: MIT
// Worked off code from: https://github.com/decentraland/marketplace-contracts/blob/master/contracts/marketplace/Marketplace.sol

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./winnie-nft.sol";
import "./dm4th.sol";


contract PetcoParkingLot is Ownable {
    using SafeMath for uint256;
    using Address for address;

    // initialize variables for the ERC20 and ERC721 contract deployments
    DM4thToken dm4;
    WinnieNFT wnft;

    // Add events for off-chain applications
    event BuyNFT();

    /*
    * @dev Initialize this contract. Acts as a constructor
    * @param _acceptedToken - Address of the ERC20 accepted for this marketplace
    * @param _targetNFT - Address of the ERC721 paid out by this marketplace
    */
    constructor (address _acceptedToken, address _targetNFT)  {
        require(_acceptedToken.isContract(), "The accepted token address must be a deployed contract!!");
        require(_targetNFT.isContract(), "The accepted NFT address must be a deployed contract!!");

        dm4 = DM4thToken(_acceptedToken);
        wnft = WinnieNFT(_targetNFT);

        address _ERC20owner = dm4.owner();
        address _ERC721owner = wnft.owner();
        require(_ERC20owner == _ERC721owner, "The owner of the ERC20 and ERC721 token contracts must be the same!!");
        transferOwnership(_ERC721owner);
    }

    /*
    * @dev Use this function to take 10 DM4th tokens to buy 1 WinnieNFT
    */
    function buyNFT() public virtual {
        // Check that the caller has 10 tokens to spend
        // require(dm4.balanceOf(msg.sender) >= 10 * 1 ether, "You do not have enough DM4 tokens to buy the Winnie NFT!!");
        // Transfer tokens from the sender to the contract
        dm4.transferFrom(msg.sender, address(this), 10 * 1 ether);
        // Mint a new Winnie NFT to this contract address and store the tokenID in a variable
        uint256 tokenID;
        tokenID = wnft.mint{value: 0}();
        // Transfer the NFT to the calling address
        // NOTE: Uses the assumption that the token ID is also incrementing by 1 (which is not always the case).
        // In this case the new minted token should be the total supply of tokens - 1.
        wnft.transferFrom(address(this), msg.sender, tokenID);

        emit BuyNFT();
    } 
}