// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    const [owner] = await hre.ethers.getSigners();

    // deploy token contract
    const ForgeTokenFactory = await hre.ethers.getContractFactory("ForgeToken");
    const ForgeToken = await ForgeTokenFactory.deploy();
    await ForgeToken.deployed();
    const ForgeTokenAddress = ForgeToken.address;

    // deploy logic contract with address of token contract
    const ForgeLogicFactory = await hre.ethers.getContractFactory("ForgeLogic");
    const ForgeLogic = await ForgeLogicFactory.deploy(ForgeTokenAddress);
    await ForgeLogic.deployed();
    const ForgeLogicAddress = ForgeLogic.address;

    // change minter address on token contract
    await ForgeToken.changeMinter(ForgeLogicAddress);
    const minterAddress = ForgeToken._minter();

    console.log(`Contracts deployed by:\t ${owner.address}`);
    console.log(`Token Contract Address:\t ${ForgeTokenAddress}`);
    console.log(`Logic Contract Address:\t ${ForgeLogicAddress}`);
    console.log(`Token Contract Minter:\t ${minterAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
