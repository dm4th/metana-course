require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const { API_URL, PRIVATE_KEY, ETHERSCAN_KEY } = process.env;
module.exports = {
   solidity: "0.8.7",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      polygon: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
   etherscan: {
     apiKey: `${ETHERSCAN_KEY}`,
   },
};
