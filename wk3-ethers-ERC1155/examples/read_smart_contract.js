const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${INFURA_ID}`);

const my_address = '0x1dA9Fe57d451F1E66B869f5FAa62c926fF723332';
const dai_address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI contract from etherscan
const ERC20_ABI = [
    "function name() view returns(string)",
    "function symbol() view returns(string)",
    "function totalSupply() view returns(uint256)",
    "function balanceOf(address) view returns(uint)",
];
const contract = new ethers.Contract(dai_address, ERC20_ABI, provider);

const main = async () => {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const myBalance = await contract.balanceOf(my_address);
    console.log(`Name:\t${name}\nSymbol:\t${symbol}\nSupply:\t${totalSupply}\nMy Balance:\t${ethers.utils.formatEther(myBalance)}`);
}

main();