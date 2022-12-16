require('dotenv').config();
const { ALCHEMY_KEY } = process.env;
const {Network, Alchemy } = require("alchemy-sdk");
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");

const settings = {
    apiKey: ALCHEMY_KEY,
    network: Network.MATIC_MAINNET
};

const alchemy = new Alchemy(settings);

// Transfer event topic for UNI
// const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
// UNI contract address on polygon
// const contractAddress = "0xb33EaAd8d922B1083446DC23f610c2567fB5180f";

// Log options object
// const uniTransfers = {
//     address: contractAddress
// };

// initialize alchemy-web3 object
// const web3 = createAlchemyWeb3(`wss://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);

// Function to work with output of transaction events
// const logTransaction = (txn) => {
//     console.log(txn);
// }

// Open websocket & listen for transfer events
console.log("Opening Web Socket")
// web3.eth.subscribe("logs", uniTransfers).on("data", logTransaction);

alchemy.ws.on("block", (blockNumber) => {
    console.log(`Block Number: ${blockNumber}`);
});