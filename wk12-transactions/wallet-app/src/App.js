import { useEffect, useState } from 'react';
import { Network, Alchemy, Wallet, Utils } from 'alchemy-sdk';

import './App.css';
import NetworkSelector from './components/NetworkSelector';
import WalletConnector from './components/WalletConnector';
import BalanceTable from './components/BalanceTable';
import TokenTable from './components/TokenTable';
import TransactionTable from './components/TransactionTable';
import { 
  MnemonicPopup, 
  ClearWalletsPopup,
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

// String formatting options
const number_options = { 
  minimumFractionDigits: 0,
  maximumFractionDigits: 2 
};

function App() {

  // connect to RPC provider and heandle network changes
  const [alchemy, setAlchemy] = useState(
    new Alchemy(alchemySettings.Goerli)
  );

  const handleNetworkChange = (alcSettings) => { 
    switch (alcSettings) {
      case "ETH - Goerli":
        setAlchemy(new Alchemy(alchemySettings.Goerli));
        break;
      case "ETH - Mainnet":
        setAlchemy(new Alchemy(alchemySettings.Ethereum));
        break;
      case "Polygon":
        setAlchemy(new Alchemy(alchemySettings.Polygon));
        break;
      default:
        break;
    }

    setTokenBalances([]);
    setTransactionHistory({sent: [], received: []})
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


  // state to handle the current wallet and list of available wallets
  const [showClear, setShowClear] = useState(false);
  
  const handleShowClearWallets = (show) => {
    setShowClear(show);
  }

  const handleClearWallets = async (val) => {
    if (val) {
      for (let w=0; w<wallets.length; w++) {
        await localStorage.removeItem(wallets[w]);
      }
      await localStorage.removeItem('walletStorage');
      handleWalletChange([], null);
    }

    setShowClear(false);
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
    if (password) {
      // Password submitted
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
    else {
      // cancel button hit
      handleAskPassword('', false);
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
    if (seed) {
      // seed submitted
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
    }
    else {
      // cancel submitted
      handleAskSeed(false);
    }
  }



  // display wallet information

  // state to hold ETH/MATIC balance 
  const [balance, setBalance] = useState('');
  // state to ask for transfer details
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  const retrieveAddressBalance = async () => {
    if (currentAddress) {
      const addrBalance = await alchemy.core.getBalance(currentAddress, 'latest');
      setBalance(
        Number(Utils.formatEther(addrBalance)).toLocaleString('en', number_options)
      );
    }
  }

  const handleTransferEth = async (toAddress, toAmount) => {
    const nonce = await alchemy.core.getTransactionCount(
      currentAddress,
      'latest'
    );

    console.log(alchemy)

    const rawTxData = {
      to: toAddress,
      value: Utils.parseEther(toAmount),
      gasLimit: "21000",
      maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
      maxFeePerGas: Utils.parseUnits("20", "gwei"),
      nonce: nonce,
      type: 2,
      chainId: alchemy.network.chainId,
    }

    await setTransferAddress(toAddress);
    await setTransferAmount(toAmount);
    await setShowTransfer(true);
  }

  // state to hold token info
  const [tokenBalances, setTokenBalances] = useState([]);

  const retrieveTokenBalances = async () => {
    if (currentAddress) {
      let balances = [];
      try {
        const resp = await alchemy.core.getTokenBalances(currentAddress);
        for (let t = 0; t < resp.tokenBalances.length; t++) {
          balances.push(
            await retrieveTokenMetadata(resp.tokenBalances[t].contractAddress, resp.tokenBalances[t].tokenBalance)
          );
        }
        setTokenBalances(balances)
      } catch (err) {
        console.log(currentAddress);
        console.log(balances);
        console.log(err);
      }
    } else {
      setTokenBalances([]);
    }
  }

  const retrieveTokenMetadata = async (contractAddress, hexBalance) => {
    const metaData = await alchemy.core.getTokenMetadata(contractAddress);
    const decBalance = Number(Utils.formatUnits(hexBalance, metaData.decimals)).toLocaleString('en', number_options);
    return {
      symbol: metaData.symbol,
      name: metaData.name,      
      logo: metaData.logo,
      balance: decBalance
    }
  }

  // state to hold historical transaction info
  const [transactionHistory, setTransactionHistory] = useState({sent: [], received: []});

  const retrieveTransactionHistory = async () => {
    if (currentAddress) {

      let history = {
        sent: [],
        received: []
      };

      let tokenLogoTemp = {};

      try {
        const sentData = await alchemy.core.getAssetTransfers({
          fromAddress: currentAddress,
          category: ["external", "internal", "erc20", "erc721", "erc1155", "specialnft"],
          order: 'desc'
        });

        for (let t = 0; t < sentData.transfers.length; t++) {
          const asset = sentData.transfers[t].asset;
          const assetAddress = sentData.transfers[t].to;
          if (!(asset in tokenLogoTemp) && asset !== 'ETH' && asset !== 'MATIC') {
            try {
              const metaData = await alchemy.core.getTokenMetadata(assetAddress);
              tokenLogoTemp.asset = metaData.logo;
            } catch (error) {
              tokenLogoTemp.asset = null;
            }
          } 
          let value = sentData.transfers[t].value;
          value ??= 0;
          history.sent.push({
            category: sentData.transfers[t].category,
            asset: asset,
            logo: (asset === 'ETH' || asset === 'MATIC') ? asset : tokenLogoTemp.asset,
            value: value.toLocaleString('en', number_options),
            txHash: sentData.transfers[t].uniqueId.split(':')[0]
          })
        }

        const receivedData = await alchemy.core.getAssetTransfers({
          toAddress: currentAddress,
          category: ["external", "internal", "erc20", "erc721", "erc1155", "specialnft"],
          order: 'desc'
        });

        for (let t = 0; t < receivedData.transfers.length; t++) {
          const asset = receivedData.transfers[t].asset;
          const assetAddress = receivedData.transfers[t].from;
          if (!(asset in tokenLogoTemp) && asset !== 'ETH' && asset !== 'MATIC') {
            try {
              const metaData = await alchemy.core.getTokenMetadata(assetAddress);
              tokenLogoTemp.asset = metaData.logo;
            } catch (error) {
              tokenLogoTemp.asset = null;
            }
          } 
          let value = receivedData.transfers[t].value;
          value ??= 0;
          history.received.push({
            category: receivedData.transfers[t].category,
            asset: asset,
            logo: (asset === 'ETH' || asset === 'MATIC') ? asset : tokenLogoTemp.asset,
            value: value.toLocaleString('en', number_options),
            txHash: receivedData.transfers[t].uniqueId.split(':')[0]
          })
        }

        setTransactionHistory(history);
      } catch (err) {
        console.log(history);
        console.log(err);
      }
    } else {
      setTransactionHistory({sent: [], received: []});
    }
  }

  const getTxLink = () => {
    switch (alchemy.config.network) {
      case 'eth-mainnet':
        return 'https://etherscan.io/tx/';
      case 'polygon-mainnet':
        return 'https://polygonscan.com/tx/';
      default:
        return 'https://goerli.etherscan.io/tx/';
    }
  }





  const walletConnector = () => {
    let showWallets;
    wallets ? showWallets = wallets : showWallets = [];
    return <WalletConnector 
              wallets={showWallets}
              address={currentAddress}
              onWalletChange={handleWalletChange} 
              showSeed={handleSeed}
              showClear={handleShowClearWallets}
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


  useEffect(() => {
    retrieveAddressBalance();
    retrieveTokenBalances();
    retrieveTransactionHistory();
  }, [
    currentAddress,
    alchemy
  ])


  return (
    <div className="App">
      <h1 className="title-text">Wallet DApp</h1>
      <NetworkSelector onNetworkChange={handleNetworkChange} />
      {walletConnector()}
      {currentAddress ? <BalanceTable network={alchemy} balance={balance} submitTransfer={handleTransferEth}/> : null}
      {currentAddress ? <TokenTable balances={tokenBalances} /> : null}
      {currentAddress ? <TransactionTable transactions={transactionHistory} txLink={getTxLink()} /> : null}
      {showMnemonic ? <MnemonicPopup phrase={seedPhrase} showSeed={handleSeed} /> : null }
      {getPassword ? <PasswordCapturePopup onSubmit={handleGetPassword} /> : null }
      {showClear ? <ClearWalletsPopup clearHandler={handleClearWallets} /> : null }
      {submitPassword ? askPasswordPopup(submitPasswordErr, submitPasswordProgress) : null }
      {submitSeed ? askSeedPopup(submitSeedErr, submitSeedDupe) : null }
    </div>
  );
}

export default App;
