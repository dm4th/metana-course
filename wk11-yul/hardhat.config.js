require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

const { REPORT_GAS, COINMARKETCAP_API } = process.env;
module.exports = {
   solidity: "0.8.9",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
   },
   gasReporter: {
    enabled: REPORT_GAS,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API,
   },
};