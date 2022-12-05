const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`); // working on main network

const main = async () => {

    // get most recent block number
    const latestBlock = await provider.getBlockNumber();
    console.log(`Latest Block:\t${latestBlock}`);

    // query the contract for transfer events
    const block = await provider.getBlock(latestBlock);
    const blockString = JSON.stringify(block, null, 2);
    console.log(`\nBlock Info:\n${blockString}`);

    // Log first transaction in the block
    const { transactions } = await provider.getBlockWithTransactions(latestBlock);
    const transactionString = JSON.stringify(transactions[0], null, 2);
    console.log(`\nFirst Transaction Info:\n${transactionString}`);
}

main();