# Ethernaut Solutions

## Problem 6

There is no need to write a contract or script for this problem. All you need to do is call the "pwn()" function in a transaction to the delgation contract as it changes the owner for you: 
```js
await sendTransaction({
  from: player.address,
  to: contract.address,
  data: "0xdd365b8b0000000000000000000000000000000000000000000000000000000000000000" // encoded version of "pwn()"
});
```

## Problem 16

We first create an attack contract (PreservationPwn in challenge16.sol) with the same memory layout as the Preservation contract. We then convert our contract's address to an integer so that we can fit the correct signature for ```setTime(uint _time)```. We can set the first library's address by making a delegatecall to the LibraryContract because it modifies the fisrt slot, so we'll call 
```js
await contract.setFirstTime("INT VERSION OF ATTACK CONTRACT ADDRESS"); 
````
so that anytime we call the setTime function, we'll now call out attack function's version. In our attack contract we simly set owner = msg.sender because we have the same memory layout. Calling the setFirstTime function with any arbotrary input will take control of the contract.

## Problem 24

Jeez this one was difficult....

## Problem 25

The first step is getting the contract of the engine contract from the motorbike contract, which is as simple as getting the storage at slot 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc (based on the UUPS protocol specs).

Next you need to create a Hack Contract that first calls "initialize" on the engine contract to assume the upgrader role. Once you're the upgrader, you can use the "upgradeToAndCall" function to call any arbitrary code in another contract (just a simple self destruct in this case).




# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```