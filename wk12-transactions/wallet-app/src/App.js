import { useEffect, useState } from 'react';
import { Network, Alchemy, Wallet } from 'alchemy-sdk';

import './App.css';
import WalletConnector from './components/WalletConnector';
import NetworkSelector from './components/NetworkSelector';
import { 
  MnemonicPopup, 
  PasswordCapturePopup, 
  PasswordAskPopup 
} from './components/Popups';

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
  const [currentWallet, setCurrentWallet] = useState(null);
  // state to disply mnemonic phrase for the user
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  // state to allow the app to store a password for easier wallet retrieval
  const [getPassword, setGetPassword] = useState(false);
  // state to ask for password for an alreaady created wallet
  const [submitPassword, setSubmitPassword] = useState(false);
  const [potentialAddress, setPotentialAddress] = useState('');
  const [submitPasswordErr, setSubmitPasswordErr] = useState(false);
  const [submitPasswordProgress, setSubmitPasswordProgress] = useState(null);

  const handleWalletChange = async (wallets, newWallet) => { 
    setWallets(wallets);
    setCurrentWallet(newWallet);

    await localStorage.setItem('walletStorage', JSON.stringify(wallets));
  }

  const handleSeed = (phrase, show) => { 
    setShowMnemonic(show);
    setSeedPhrase(phrase);

    if (!show) setGetPassword(true);
  }

  const handleGetPassword = async (password) => {
    setGetPassword(false);

    // encrypt the wallet with the password and save to browser storage
    const encryptedJSON = await currentWallet.encrypt(password);
    await localStorage.setItem(currentWallet.address, JSON.stringify(encryptedJSON));
  }

  const handleAskPassword = (walletAddress, show) => { 
    setSubmitPassword(show);
    setPotentialAddress(walletAddress);
  }

  const handleSubmitPassword = async (password) => {
    // check for the correct password
    setSubmitPasswordErr(false);
    const encryptedJson = await JSON.parse(localStorage.getItem(potentialAddress)); 
    let newWallet;
    try {
      newWallet = await Wallet.fromEncryptedJson(encryptedJson, password, setSubmitPasswordProgress);

      setCurrentWallet(newWallet);
      setPotentialAddress('');
      setSubmitPassword(false);
      setSubmitPasswordErr(false);
      setSubmitPasswordProgress(null);
    } catch (err) {
      console.log(err);
      setSubmitPasswordErr(true);
      setSubmitPasswordProgress(null);
    }
  }

  const walletConnector = () => {
    let showWallets;
    wallets ? showWallets = wallets : showWallets = [];
    return <WalletConnector 
              wallets={showWallets} 
              onWalletChange={handleWalletChange} 
              showSeed={handleSeed}
              askPassword={handleAskPassword}
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

  const askPasswordPopup = (err, prog) => {
    return (
      <PasswordAskPopup onSubmit={handleSubmitPassword} errorFlag={err} progress={prog} />
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
      {submitPassword ? askPasswordPopup(submitPasswordErr, submitPasswordProgress) : null }
    </div>
  );
}

export default App;
