require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

module.exports = {
   solidity: "0.8.9",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
   },
};