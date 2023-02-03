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

We first create an attack contract (PreservationPwn in challenge16.sol) with the same memory layout as the Preservation contract. We then convert our contract's address to an integer so that we can fit the correct signature for 
```
setTime(uint _time)
```
. We can set the first library's address by making a delegatecall to the LibraryContract because it modifies the fisrt slot, so we'll call 
```js
await contract.setFirstTime("INT VERSION OF ATTACK CONTRACT ADDRESS"); 
```
so that anytime we call the setTime function, we will now call out attack function's version. In our attack contract we simply set owner = msg.sender because we have the same memory layout. Calling the setFirstTime function with any arbotrary input will take control of the contract.

## Problem 24

Jeez this one was difficult.... I outlined each step in detail in comments in scripts/challenge24.js

The first step is realizing that you can connect to both the proxy & wallet contracts with the same contract address.
Using that knowledge, you can call 
```js
await proxy.connect(player).proposeNewAdmin(player.address);
```
on the proxy contract to make yourself the owner
of the wallet contract (the function overwrites slot 0 in both contracts).

The second step is adding yourself to the whitelist to be able to perform functions on the wallet contract. Now that you're
the owner of teh wallet contract you can just call 
```js
await wallet.connect(player).addToWhitelist(player.address)
```

Now that we can perform actions on the wallet contract, we need to call "setMaxBalance" to overwrite slot 1 in both contracts (including the admin address in the proxy.. our goal).

Before we can do taht though we need to make the contract have 0 balance. To drain the contract we create a multicall with 3 functions and a msg.value == the contract's balance:
- deposit --> adds eth to the contract and increments our balance to 1 contract balance
- multicall(deposit) --> we then have to re-call multicall to reset the flag that we aren't reusing our msg.value. this sets our balance to 2 contract balances even though we're only sending 1 contract balance.
- execute(YOUR_ADDRESS, contract balance * 2, []) --> we withdraw 2 contract balances worth of ETH to drain the contract
```js
const contractEth = await hre.ethers.provider.getBalance(wallet.address);
const func1 = wallet.interface.encodeFunctionData('deposit');
const func2 = wallet.interface.encodeFunctionData('multicall', [[func1]]);
const func3 = wallet.interface.encodeFunctionData('execute', [player.address, contractEth*2, []]);
const funcArray = [func1, func2, func3];
await wallet.connect(player).multicall(funcArray, { from: player.address, value: contractEth });
```

Now that the contract is drained we can call 
```js
await wallet.connect(player).setMaxBalance(player.address)
```
to beat the level.

## Problem 25

The first step is getting the contract of the engine contract from the motorbike contract, which is as simple as getting the storage at slot 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc (based on the UUPS protocol specs).

Next you need to create a Hack Contract that first calls "initialize" on the engine contract to assume the upgrader role. Once you're the upgrader, you can use the "upgradeToAndCall" function to call any arbitrary code in another contract (just a simple self destruct in this case).