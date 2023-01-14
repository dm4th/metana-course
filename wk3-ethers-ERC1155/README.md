# ERC1155 Project - Week 3

This project demonstrates a ERC1155 "game" with a react frontend.

ERC1155 Token Contract URL: https://polygonscan.com/address/0xC5307A8237b8E908b1005456c56bB4415a71d4f3
ERC1155 Game Logic Contract URL: https://polygonscan.com/address/0xb01DB85F3E9844C6FDb4f2000aD8cE18b2B39CB8

To test functionality from the root directory:

```shell
npx hardhat test
```

To run the web server locally and interact with the game in the browser:

```shell
cd frontend
npm start
```

Using the solidity-coverage module, I've confimed 100% function, statement, and branch coverage across all contracts.

I've also run mutation testing using vertigo on the smart contracts in the /contracts directory. Only 2 of 42 mutations were not killed. One mutation resulted in equivalence (did not enter a string to name the ERC1155 token). The only mutation that lived was changing the mintStarter token cooldown timer from checking that the cooldown time was greater than needed to greater than or equal to the time needed, which feels alright to me.

Link to commit of fully covered & mutation tested code: https://github.com/dm4th/metana-course/commit/5b96e25091045bb668d3b82f28c30f5847f0b886