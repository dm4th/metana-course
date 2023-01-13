// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    const [owner] = await ethers.getSigners();
    const DM4Factory = await ethers.getContractFactory("DM4thToken");

    const DM4Token = await DM4Factory.deploy();

    await DM4Token.deployed();
    const DM4TokenAddress = DM4Token.address;

    console.log(`Contracts deployed by:\t ${owner.address}`);
    console.log(`Token Contract Address:\t ${DM4TokenAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
