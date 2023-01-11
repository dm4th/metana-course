require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

const { API_URL, PRIVATE_KEY, POLYGONSCAN_KEY } = process.env;
module.exports = {
   solidity: "0.8.7",
   defaultNetwork: "polygon",
   networks: {
      hardhat: {},
      polygon: {
         url: API_URL,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
   etherscan: {
     apiKey: `${POLYGONSCAN_KEY}`,
   },
};
