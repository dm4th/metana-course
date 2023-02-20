// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require('hardhat')

const PROXY = '0x2CB66DF2e3C95c34B3461620B07639241916634F'

async function main () {

  console.log(`Previous Proxy Address:\t ${PROXY}`);
  const impl_addr = await upgrades.erc1967.getImplementationAddress(PROXY);
  console.log(`Previous Implementation Address:\t ${impl_addr}`);

  const [owner] = await ethers.getSigners();

  // deploy upgraded ERC721 implementation
  const WNEV2 = await ethers.getContractFactory("WinnieNFTV2");
  const wnev2 = await upgrades.upgradeProxy(PROXY, WNEV2);

  console.log(`Contracts upgraded by:\t ${owner.address}`);
  console.log(`New Proxy Address:\t ${wnev2.address}`);
  const new_impl_addr = await upgrades.erc1967.getImplementationAddress(wnev2.address);
  console.log(`New Implementation Address:\t ${new_impl_addr}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
