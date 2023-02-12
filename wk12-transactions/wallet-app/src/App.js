import { useEffect, useState } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

import './App.css';
import WalletConnector from './components/WalletConnector';
import NetworkSelector from './components/NetworkSelector';

// const ethers = require("@nomiclabs/hardhat-ethers");

// Initial RPC Settings - Set to Goerli
const alchemySettings = {
  Goerli: {
    apiKey: process.env.REACT_APP_GOERLI_KEY,
    network: Network.ETH_GOERLI,
  },
  Polygon: {
    apiKey: process.env.REACT_APP_POLYGON_KEY,
    network: Network.MATIC_MAINNET,
  },
  Ethereum: {
    apiKey: process.env.REACT_APP_ETH_KEY,
    network: Network.ETH_MAINNET,
  },
};

function App() {

  // connect to RPC provider and heandle network changes
  const [alchemy, setAlchemy] = useState(
    new Alchemy(alchemySettings.Goerli)
  );

  const handleNetworkChange = (alcSettings) => { 
    setAlchemy(new Alchemy(alcSettings));
  }

  const networkSelector = () => {
    return (
      <NetworkSelector alchemySettings={alchemySettings} onNetworkChange={handleNetworkChange} />
    )
  }



  // connect to wallet & handle change and creation of new wallets
  const [wallets, setWallets] = useState(
    JSON.parse(localStorage.getItem('walletStorage'))
  );
  const [currentWallet, setCurrentWallet] = useState(
    wallets[0]
  );

  const handleWalletChange = (wallets, currWallet) => { 
    setWallets(wallets);
    setCurrentWallet(currWallet);
  }

  const walletSelector = () => {
    if (wallets) {
      return (
        <WalletConnector wallets={wallets} onWalletChange={handleWalletChange} />
      )
    } else {
      return (
        <WalletConnector wallets={[]} onWalletChange={handleWalletChange} />
      )
    }
  }

  return (
    <div className="App">
      <h1 className="title-text">Wallet DApp</h1>
      <div>
        {networkSelector()}
      </div>
      <div>
        {walletSelector()}
      </div>
    </div>
  );
}

export default App;
