const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${INFURA_ID}`); // working on test network

// Contract Address for DM4 token on Goerli
const contract_address = '0xAa0c29a5A166F0e3dBD086C8eDB8C02AD4fb2761';
const contract_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",

    "event Transfer(address indexed from, address indexed to, uint256 amount)"
];
const contract = new ethers.Contract(contract_address, contract_ABI, provider);

const main = async () => {
    // get most recent block number
    const latestBlock = await provider.getBlockNumber();
    // query the contract for transfer events
    const transferEvents = await contract.queryFilter('Transfer', latestBlock - 1000, latestBlock);

    console.log(transferEvents);
}

main();