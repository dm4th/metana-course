const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${INFURA_ID}`); // working on test network

const account1 = ''; // TEST1 - sender
const account2 = ''; // TEST2 - receiver

// Private Keys for Test Accounts
const private1 = '';
const private2 = '';

const wallet1 = new ethers.Wallet(private1, provider);
const wallet2 = new ethers.Wallet(private2, provider);

// Contract Address for DM4 token on Goerli
const contract_address = '0xAa0c29a5A166F0e3dBD086C8eDB8C02AD4fb2761';
const contract_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)"
];
const contract = new ethers.Contract(contract_address, contract_ABI, provider);

const main = async () => {
    // show account balances before transfer
    var bal1 = await contract.balanceOf(account1);
    var bal2 = await contract.balanceOf(account2);
    console.log(`DM4 Before\nAccount 1:\t${ethers.utils.formatEther(bal1)}\nAccount 2:\t${ethers.utils.formatEther(bal2)}\n`);


    // send DM4
    const sendAmt = ethers.utils.parseEther("100");
    const contractWithWallet = contract.connect(wallet1);
    const tx = await contractWithWallet.transfer(account2, sendAmt);

    // wait for transaction to execute
    await tx.wait();
    // fetch transaction
    console.log(tx);

    // show account balances after transfer
    bal1 = await contract.balanceOf(account1);
    bal2 = await contract.balanceOf(account2);
    console.log(`\nDM4 Account 1:\t${ethers.utils.formatEther(bal1)}\nAccount 2:\t${ethers.utils.formatEther(bal2)}\n`);
}

main();