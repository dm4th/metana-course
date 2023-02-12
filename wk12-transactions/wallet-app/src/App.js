import { useEffect, useState } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

import './App.css';
import WalletConnector from './components/WalletConnector';

// const ethers = require("@nomiclabs/hardhat-ethers");

// Initial RPC Settings - Set to Goerli
const initSettings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API,
    network: Network.ETH_GOERLI,
};

function App() {

  // create provider object to interact with the blockchain
  // const alchemy = new Alchemy(settings);

  // connect to wallets and RPC provider
  console.log(Network);
  const [alchemy, setAlchemy] = useState(
    new Alchemy(initSettings)
  );
  const [wallets, setWallets] = useState(
    JSON.parse(localStorage.getItem('walletStorage'))
  );
  const [currentWallet, setCurrentWallet] = useState(
    null
  );

  const handleWalletChange = (wallets, currWallet) => { 
    setWallets(wallets);
    setCurrentWallet(currWallet);
  }

  const createWalletStarter = () => {
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
        {createWalletStarter()}
      </div>
    </div>
  );
}

export default App;
