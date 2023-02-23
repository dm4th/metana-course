# DamnVulnerableDeFi - Free Rider

The vulnerability is in the "buyOne" function, where it transfers the NFT before making the payment... This means that someone with enough ETH for one NFT can call the buyMany function for every NFT with the amount of ETH for just one NFT (because you are continuously paid back for the ETH spent each time rather than actually spending it).


The difficulty comes in getting the initial 15ETH to be able to start this attack chain... You start with only 0.1ETH. 

To actually get enough ETH to perform the attack, we'll use the Uniswap V2 pair between WETH & DVT to perform a flash swap, and make sure we pay back the loaned WETH in the same transaction.

The attack contract needs teh following steps then:
1. Create a swap of 15 ETH (the price of one NFT) WETH <--> 0 DVT in the Uniswap interface
2. Perform a swap using uniswapV2Call passing the attack contract's address as the sender and having a non-zero calldata sent in (https://docs.uniswap.org/contracts/v2/guides/smart-contract-integration/using-flash-swaps)
3. Implement a "uniswapV2Call" function in the attack contract that will: 
    1. convert the WETH into ETH
    2. Buy 6 NFTs for the price of one (due to the marketplace vulnerablility)
    3. Convert 15 * 1.03 ETH back into WETH (to cover the pool's LP %)
    4. Send the WETH back to the pool
4. Safe Transfer the 6 NFTs to the FreeRiderRecovery contract to trigger its onERC721Received function
5. Withdraw ETH from the attack contract