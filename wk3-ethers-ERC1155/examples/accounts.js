const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);

const address = '0x1dA9Fe57d451F1E66B869f5FAa62c926fF723332';

const main = async () => {
    const balance = await provider.getBalance(address);
    console.log(`ETH Balance of ${address} --> ${ethers.utils.formatEther(balance)} ETH`);
}

main();