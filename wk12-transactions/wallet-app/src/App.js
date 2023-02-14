import { useEffect, useState } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

import './App.css';
import WalletConnector from './components/WalletConnector';
import NetworkSelector from './components/NetworkSelector';
import { MnemonicPopup, PasswordCapturePopup } from './components/Popups';

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
  const [wallets, setWallets] = useState(JSON.parse(localStorage.getItem('walletStorage')));
  const [currentAddress, setCurrentAddress] = useState(null);
  // state to disply mnemonic phrase for the user
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  // state to allow the app to store a password for easier wallet retrieval
  const [getPassword, setGetPassword] = useState(false);

  const handleWalletChange = (wallets, address) => { 
    setWallets(wallets);
    setCurrentAddress(address);
  }

  const handleSeed = (phrase, show) => { 
    setShowMnemonic(show);
    setSeedPhrase(phrase);

    if (!show) setGetPassword(true);
  }

  const storePassword = (password) => {
    return password;
  }

  const handleGetPassword = (password) => {
    setGetPassword(false);

    console.log(password);
    console.log(currentAddress);
  }

  const walletConnector = () => {
    let showWallets;
    wallets ? showWallets = wallets : showWallets = [];
    return <WalletConnector 
              wallets={showWallets} 
              onWalletChange={handleWalletChange} 
              showSeed={handleSeed}
            />
  }

  const mnemonicPopup = () => {
    return (
      <MnemonicPopup phrase={seedPhrase} showSeed={handleSeed} />
    )
  }

  const getPasswordPopup = () => {
    return (
      <PasswordCapturePopup onSubmit={handleGetPassword} />
    )
  }

  // useEffect(() => {
  //   setWallets(wallets);
  //   setCurrentWallet(currentWallet);
  // }, []);

  return (
    <div className="App">
      <h1 className="title-text">Wallet DApp</h1>
      <div>
        {networkSelector()}
      </div>
      <div>
        {walletConnector()}
      </div>
      {showMnemonic ? mnemonicPopup() : null }
      {getPassword ? getPasswordPopup() : null }
    </div>
  );
}

export default App;
