# Damn Vulnerable DeFi - Compromised Challenge

To confirm that I broke the contract run:
```shell
npx hardhat test
```

- Start by copy+pasta the server output from the challenge front page as strings into the test script
- I noticed that the strings were Hex Codes for ASCII characters from testing a previous project (week 11 Strings)
- I converted the hex -> ASCII characters and then with the help of a hint from the assignments page for the class I converted that output to a Hex value (assuming that the string was in base64... never would have gotten that without the help)

- From here I had to google what to do next... I didn't catch that these could be private keys (I knew they weren't public keys becasue the strings were too long)
- Once you can impersonate more than half the oracles this actually becomes quite easy because the exchange uses the median value of it's oracles to set the price for the asset
    - First set the two oracle prices to 0 --> this sets the excahnge price to 0 (there are 3 oracles)
    - Buy and NFT for 1 Wei (it gets immediately refunded)
    - Reset the price back up to the amount left in the exchange
    - Sell the NFT back to the exchange
- Voila... hacked