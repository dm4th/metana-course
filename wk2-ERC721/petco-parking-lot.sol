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

    // Create a mapping of tokenID --> address that is currently staking that token
    // And also create a mapping for tokenID --> timestamp when the last withdrawal happened for that NFT
    mapping(uint256 => address) private _stakers;
    mapping(uint256 => uint256) private _withdrawalTimes;

    // Constant for ERC20 price to pay for an NFT and to withdraw from the contract for staking
    uint256 private constant ERC20_PRICE = 10 * 1 ether;
    // Constant for how long you need to wait before minting more tokens (in seconds)
    uint256 private constant WITHDRAW_TIME = 86400;

    // Add events for off-chain applications
    event BuyNFT();
    event StakeNFT(uint256 _tokenID);
    event UnStakeNFT(uint256 _tokenID);
    event WithdrawERC20(uint256 _tokenID);

    /*
    * @dev Initialize this contract. Acts as a constructor
    * @param _acceptedToken - Address of the ERC20 accepted for this marketplace
    * @param _targetNFT - Address of the ERC721 paid out by this marketplace
    */
    constructor (address _acceptedToken, address _targetNFT)  {
        // check that the input addresses for associated ERC20 and ERC721 contracts are in fact contracts
        require(_acceptedToken.isContract(), "The accepted token address must be a deployed contract!!");
        require(_targetNFT.isContract(), "The accepted NFT address must be a deployed contract!!");

        // instantiate contract instances
        dm4 = DM4thToken(_acceptedToken);
        wnft = WinnieNFT(_targetNFT);

        // verify that all 3 contracts (including this one) have the same owner, and then set the ownership
        // of the ERC20 and ERC721 contracts to this contract's address
        address _ERC20owner = dm4.owner();
        address _ERC721owner = wnft.owner();
        require(_ERC20owner == _ERC721owner && _ERC20owner == owner(), "The owner of the ERC20 and ERC721 token contracts must be the same and the creator of this contract!!");
    }

    /*
    * @dev Use this function to take 10 DM4th tokens to buy 1 WinnieNFT
    */
    function buyNFT() public virtual {
        // No need to check for the appropriate balance, handled in ERC20 contract
        // Transfer tokens from the sender to the contract
        dm4.transferFrom(msg.sender, address(this), ERC20_PRICE);
        // Mint a new Winnie NFT to the caller of the contract
        wnft.mint(msg.sender);

        emit BuyNFT();
    } 

    /*
    * @dev Use this function to stake an NFT with the contract
    * @param tokenID - ID of the token to stake
    */
    function stakeNFT(uint256 tokenID) public virtual {
        // transfer NFT to the contract - exception handling done in ERC721 contract
        wnft.transferFrom(msg.sender, address(this), tokenID);
        // add tokenID to staking mapping
        _stakers[tokenID] = msg.sender;
        // No need to include an update for _withdrawalTimes, new tokens will auto-check to 0, 
        // and we don't want to overwrite old values because of the re-staking bug

        emit StakeNFT(tokenID);
    }

    /*
    * @dev Use this function to unstake an NFT with the contract
    * @param tokenID - ID of the token to unstake
    */
    function unStakeNFT(uint256 tokenID) public virtual {
        // check that the user has rightfully taked that token and can withdraw it
        require(_stakers[tokenID] == msg.sender, "You are not the original owner of the token!!");

        // transfer NFT back to the user from the contract - exception handling done in ERC721 contract
        wnft.transferFrom(address(this), msg.sender, tokenID);
        // change the _stakers address to the 0 address
        _stakers[tokenID] = address(0);

        // No need to include an update for _withdrawalTimes, new tokens will auto-check to 0, 
        // and we don't want to overwrite old values because of the re-staking bug

        // If the token hasn't been staked before, set the withdrawal timer to 0 (i.e. any check will pass on elapsed time)
        // else leave the withdrawal time alone to avoid re-staking bug
        // _withdrawalTimes[tokenID] = 0;
        emit UnStakeNFT(tokenID);
    } 

    /*
    * @dev Use this function to withdraw ERC20 tokens for staked NFTs over certain timeframes
    * @param tokenID - ID of the token to withdraw for
    */
    function withdrawERC20(uint256 tokenID) public virtual {
        // check that the user has rightfully staked that token and can claim ERC20 tokens
        require(_stakers[tokenID] == msg.sender, "You are not the original owner of the token!!");
        // check that the contract still owns the NFT
        require(wnft.ownerOf(tokenID) == address(this), "This token is not staked currently!!");
        // check that the user hasn't withdrawn tokens in the previous timeframe
        require(block.timestamp - _withdrawalTimes[tokenID] >= WITHDRAW_TIME, "You have already withdrawn for this token... You must wait!!");

        // mint ERC20_PRICE ERC20 tokens to the calling address
        dm4.mintTokensToAddress(msg.sender, ERC20_PRICE);
        // reset the timer on that tokenID in the _withdrawalTimes mapping
        _withdrawalTimes[tokenID] = block.timestamp;
        // add additional allowance for next withdrawal
        emit WithdrawERC20(tokenID);
    } 
}