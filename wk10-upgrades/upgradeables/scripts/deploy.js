// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')

async function main () {
  const [owner] = await ethers.getSigners();

  // deploy ERC20 proxy
  const DM4 = await ethers.getContractFactory("DM4thToken");
  const dm4 = await upgrades.deployProxy(DM4, ["DM4th", "DM4"], { initializer: "initialize" });

  // deploy ERC721 proxy
  const WNE = await ethers.getContractFactory("WinnieNFT");
  const wne = await upgrades.deployProxy(WNE, ["Winnie", "WNE"], { initializer: "initialize" });

  // deploy Minter proxy
  const PPL = await ethers.getContractFactory("PetcoParkingLot");
  const ppl = await upgrades.deployProxy(PPL, [dm4.address, wne.address], { initializer: "initialize" });

  // Upgrade the minter addresses on each of the ERC20 and ERC721 contracts
  await dm4.connect(owner).changeMinter(ppl.address);
  await wne.connect(owner).changeMinter(ppl.address);

  console.log(`Contracts deployed by:\t ${owner.address}`);
  console.log(`DM4 Token Contract Address:\t ${dm4.address}`);
  console.log(`WNE NFT Contract Address:\t ${wne.address}`);
  console.log(`PPL Minting Contract Address:\t ${ppl.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
