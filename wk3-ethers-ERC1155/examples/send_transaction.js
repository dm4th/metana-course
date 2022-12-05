const { ethers } = require("ethers");

const INFURA_ID = '585b243f415f4d08b2599e59e8a15053';
const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${INFURA_ID}`); // working on test network

const account1 = ''; // TEST1 - sender
const account2 = ''; // TEST2 - receiver

// Private Keys for Test Accounts
const private1 = '';
const private2 = '';
const wallet1 = new ethers.Wallet(private1, provider);

const main = async () => {
    // show account balances before transfer
    var bal1 = await provider.getBalance(account1);
    var bal2 = await provider.getBalance(account2);
    console.log(`Before\nAccount 1:\t${ethers.utils.formatEther(bal1)}\nAccount 2:\t${ethers.utils.formatEther(bal2)}\n`);


    // send ether
    const tx = await wallet1.sendTransaction({
        to: account2,
        value: ethers.utils.parseEther("0.01")
    });

    // wait for transaction to execute
    await tx.wait();
    // fetch transaction
    console.log(tx);

    // show account balances after transfer
    bal1 = await provider.getBalance(account1);
    bal2 = await provider.getBalance(account2);
    console.log(`\nAccount 1:\t${ethers.utils.formatEther(bal1)}\nAccount 2:\t${ethers.utils.formatEther(bal2)}\n`);
}

main();