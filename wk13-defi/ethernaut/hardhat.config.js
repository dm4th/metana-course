require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

const { API_URL, PRIVATE_KEY, ETHERSCAN_KEY, REPORT_GAS, COINMARKETCAP_API } = process.env;
module.exports = {
   solidity: "0.8.17",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      goerli: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      },
   },
   etherscan: {
     apiKey: `${ETHERSCAN_KEY}`,
   },
   gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API,
   },
};