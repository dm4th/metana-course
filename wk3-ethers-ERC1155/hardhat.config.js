require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

const { API_URL, PRIVATE_KEY, POLYGONSCAN_KEY } = process.env;
module.exports = {
   solidity: "0.8.7",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {},
      polygon: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      },
      vertigo_test_network_1: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*"
      },
      vertigo_test_network_2: {
        host: "127.0.0.1",
        port: 8546,
        network_id: "*"
      },
   },
   etherscan: {
     apiKey: `${POLYGONSCAN_KEY}`,
   },
};
