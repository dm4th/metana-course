import { useEffect, useState } from 'react';
import { Network, Alchemy, Wallet } from 'alchemy-sdk';

import './App.css';
import WalletConnector from './components/WalletConnector';
import NetworkSelector from './components/NetworkSelector';
import { 
  MnemonicPopup, 
  PasswordCapturePopup, 
  PasswordAskPopup,
  SeedAskPopup
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

  // state to handle the current wallet and list of available wallets
  const [wallets, setWallets] = useState(JSON.parse(localStorage.getItem('walletStorage')));
  const [currentAddress, setCurrentAddress] = useState(null);
  const [currentWallet, setCurrentWallet] = useState(null);

  const handleWalletChange = async (wallets, newWallet) => { 
    setWallets(wallets);
    setCurrentWallet(newWallet);

    if (newWallet) {
      setCurrentAddress(newWallet.address);
    } else {
      setCurrentAddress(null);
    }

    await localStorage.setItem('walletStorage', JSON.stringify(wallets));
  }


  // state to disply mnemonic phrase for the user
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState('');
  // state to allow the app to store a password for easier wallet retrieval
  const [getPassword, setGetPassword] = useState(false);

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

  // state to ask for password for an alreaady created wallet
  const [submitPassword, setSubmitPassword] = useState(false);
  const [potentialAddress, setPotentialAddress] = useState('');
  const [submitPasswordErr, setSubmitPasswordErr] = useState(false);
  const [submitPasswordProgress, setSubmitPasswordProgress] = useState(null);

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
      setCurrentAddress(newWallet.address);
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

  // state to ask for a mneumonic seed phrase to import a new wallet
  const [submitSeed, setSubmitSeed] = useState(false);
  const [submitSeedErr, setSubmitSeedErr] = useState(false);
  const [submitSeedDupe, setSubmitSeedDupe] = useState(false);

  const handleAskSeed = (show) => { 
    setSubmitSeed(show);
  }

  const handleSubmitSeed = async (seed) => {
    // check for the correct password
    setSubmitSeedErr(false);
    setSubmitSeedDupe(false);
    try {
      // check for valid checksum
      const newWallet = await Wallet.fromMnemonic(seed);

      if (await JSON.parse(localStorage.getItem(newWallet.address))) {
        // wallet already imported
        setSubmitSeedDupe(true);
      } else {
        // successful update state for wallets
        let walletsArr = wallets;
        walletsArr.push(newWallet.address);
        setWallets(walletsArr);
        setCurrentAddress(newWallet.address);
        setCurrentWallet(newWallet);
        await localStorage.setItem('walletStorage', JSON.stringify(walletsArr));
  
        // ask for a password for the new wallet
        setSubmitSeed(false);
        setGetPassword(true);
      }
    } catch(err) {
      // invalid seed phrase
      console.log(err);
      setSubmitSeedErr(true);
    }

    console.log(currentWallet);
  }





  const walletConnector = () => {
    let showWallets;
    wallets ? showWallets = wallets : showWallets = [];
    return <WalletConnector 
              wallets={showWallets}
              address={currentAddress}
              onWalletChange={handleWalletChange} 
              showSeed={handleSeed}
              askPassword={handleAskPassword}
              askSeed={handleAskSeed}
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

  const askSeedPopup = (err, dupe) => {
    return (
      <SeedAskPopup onSubmit={handleSubmitSeed} errorFlag={err} dupeFlag={dupe} />
    )
  }


  // useEffect(() => {
  //   setWallets
  // }, [])


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
      {submitSeed ? askSeedPopup(submitSeedErr, submitSeedDupe) : null }
    </div>
  );
}

export default App;
