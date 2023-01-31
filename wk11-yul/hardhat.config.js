require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

const { API_URL, PRIVATE_KEY, POLYGONSCAN_KEY, REPORT_GAS, COINMARKETCAP_API } = process.env;
module.exports = {
   solidity: "0.8.9",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      polygon: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      },
   },
   etherscan: {
     apiKey: `${POLYGONSCAN_KEY}`,
   },
   gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API,
   },
};