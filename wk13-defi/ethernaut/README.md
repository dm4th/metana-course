# DeFi Ethernaut Problems

## Challenge 9
All we have to do is become the King with a contract that automatically reverts in the fallback function

## Challenge 22
Because the dex doesn't calculate swap prices with a fixed constant (it uses the ratio between the two tokens instead), we can continuously swap back and forth between the tokens, slowly draining the overall balance in the Dex. At a certain point you can just swap for the full amount of one of the tokens in the Dex, breaking the contract.

## Challenge 23
Similar to the last problem, we can swap back and forth to drain the Dex of one of the tokens. This time though to drain the contract of both tokens we'll have to take advantage of how the Dex doesn't check which tokens it's calculating the swap price for. I used an old ERC20 token I had where I coud mint tokens to any address. I minted the remaining balance in the Dex's worth of the dummy token to make the swap ratio 1:1, then swapped that amount of tokens into the Dex again to drain the Dex of the other token.
