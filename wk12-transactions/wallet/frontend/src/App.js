import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

import './App.css';
import { InputForm } from './components/InputForm';
import { InputButton, InputButton2 } from './components/InputButton';
import WalletConnector from './components/WalletConnector';
import { msgTypes, domainData } from './components/TypedDataStructs';

import tokenContract from './contracts/ForgeToken.json';
import contract from './contracts/ForgeLogic.json';

const tokenAddress = '0xe94f12742EE91C0e18DE5B7edE6b9Af628492e22';
const tokenABI = tokenContract.abi;

const address = '0x9d37668eeE2EEf278F5C9EaD0213f88d7B2b4415';
const abi = contract.abi;

// RPC Settings
const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_API,
    network: Network.ETH_GOERLI,
};

function App() {
  // create provider object to interact with the blockchain
  const alchemy = new Alchemy(settings);

  // connect to wallets
  const [wallets, setWallets] = useState(JSON.parse(localStorage.getItem('walletStorage')));
  const [currentWallet, setCurrentWallet] = useState(null);

  const handleWalletChange = (wallets, currWallet) => { 
    setWallets(wallets)
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
  

  // starter section input
  const [inputStarterValue, setStarterValue] = useState('');

  function handleStarterValueChange(inVal) {
    setStarterValue(inVal.target.value);
  }

  const mintStarterHandler = async (value) => { 
    try {
        // estimate gas prices
      const provider = await alchemy.config.getProvider();
      const gasPriceEstimate = await (await provider.getGasPrice()).toNumber();

        // get a contract instance to estimate gas usage by sending from the current wallet
      const wallet = new ethers.Wallet(currentWallet.privateKey, provider);
      const logicContract = new ethers.Contract(address, abi, wallet);
      const gasLimitEstimate = await (await logicContract.estimateGas.mintStarter(value)).toNumber();

        // calc nonce
      const nonceCalc = currentWallet.transactions.length;

        // calc data payload
      const functionSelector = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes('mintStarter(uint256)')
      ).slice(0,10);
      const argHex = ethers.utils.hexZeroPad(
        ethers.utils.hexlify(Number(value)), 32
      );
      const dataPayload = ethers.utils.hexConcat([functionSelector, argHex]);

      // create message
      const msg_1 = {
        nonce: ethers.utils.hexlify(nonceCalc),
        gasPrice: ethers.utils.hexlify(gasPriceEstimate),
        gasLimit: ethers.utils.hexlify(gasLimitEstimate),
        to: address,
        value: ethers.utils.parseEther("0").toHexString(),
        data: dataPayload,
        chainId: 5  // Goerli Chain ID
      }

      const msg_2 = JSON.stringify({
        types: msgTypes,
        domain: domainData,
        primaryType: 'mintStarter',
        message: msg_1
      })

      console.log(msg);

      //sign transaciton
      // tx.sign

      // provider.sendTransaction()
    } catch (err) {
      console.log(err);
    }
  }

  const burnHandler = async (value) => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const logicContract = new ethers.Contract(address, abi, signer);

        console.log(`Burning: ${Number(value)}`);
        let tx = await logicContract.connect(signer).burnToken(value);

        console.log(`Burning Now...\nTX: https://polygonscan.com/tx/${tx.hash}`);
        await tx.wait();

        console.log('Done!!')
      } else console.log('Ethereum Object does not exist');
    } catch (err) {
      console.log(err);
    }
  }

  const mintStarterInput = () => {
    return (
      <InputForm label="Starter Token Select" inputs={[0,1,2]} handleChange={handleStarterValueChange} />
    )
  }

  const mintStarterButton = () => {
    return (
      <InputButton label="Mint" className="cta-button mint-button" handleClick={mintStarterHandler} inputValue={inputStarterValue} />
    )
  }

  const burnStarterButton = () => {
    return (
      <InputButton label="Burn" className="cta-button burn-button" handleClick={burnHandler} inputValue={inputStarterValue} />
    )
  }
  
  const starterLayout = () => {
    return (
      <div className="token-section">
      <h2 className='token-title'>
        Interactions with Tokens 0 to 2
      </h2>
        {mintStarterInput()}
        {mintStarterButton()}
        {burnStarterButton()}
      </div>
    )
  }
  

  // higher section input
  const [inputHigherValue, setHigherValue] = useState('');

  function handleHigherValueChange(inVal) {
    setHigherValue(inVal.target.value);
  }

  const mintHigherHandler = async (value) => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const logicContract = new ethers.Contract(address, abi, signer);

        console.log(`Minting higher: ${value}`);
        let tx = await mintHigherSwitch(value, logicContract, signer);

        console.log(`Minting Now...\nTX: https://polygonscan.com/tx/${tx.hash}`);
        await tx.wait();

        console.log('Done!!')
      } else console.log('Ethereum Object does not exist');
    } catch (err) {
      console.log(err);
    }
  }

  const mintHigherSwitch = async (value, logicContract, signer) => { 
    console.log(value);
    switch(value) {
      case '3': return logicContract.connect(signer).mint3();
      case '4': return logicContract.connect(signer).mint4();
      case '5': return logicContract.connect(signer).mint5();
      case '6': return logicContract.connect(signer).mint6();
      default: throw Error;
    }
  }

  const mintHigherInput = () => {
    return (
      <InputForm label="Higher Token Select" inputs={[3,4,5,6]} handleChange={handleHigherValueChange} />
    )
  }

  const mintHigherButton = () => {
    return (
      <InputButton label="Mint" className="cta-button mint-button" handleClick={mintHigherHandler} inputValue={inputHigherValue} />
    )
  }

  const burnHigherButton = () => {
    return (
      <InputButton label="Burn" className="cta-button burn-button" handleClick={burnHandler} inputValue={inputHigherValue} />
    )
  }
  
  const higherLayout = () => {
    return (
      <div className="token-section">
        <h2 className='token-title'>
          Interactions with Tokens 3 to 6
        </h2>
        {mintHigherInput()}
        {mintHigherButton()}
        {burnHigherButton()}
      </div>
    )
  }


  // Handle Transfers
  const [inputTransferValue, setTransferInput] = useState('');
  const [outputTransferValue, setTransferOutput] = useState('');

  function handleTransferInputChange(inVal) {
    setTransferInput(inVal.target.value);
  }
  function handleTransferOutputChange(inVal) {
    setTransferOutput(inVal.target.value);
  }
  
  const transferHandler = async (input, output) => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const logicContract = new ethers.Contract(address, abi, signer);

        console.log(`Transferring ${input} for ${output}`);
        let tx = await logicContract.connect(signer).transferToken(input, output);

        console.log(`Transferring Now...\nTX: https://polygonscan.com/tx/${tx.hash}`);
        await tx.wait();

        console.log('Done!!')
      } else console.log('Ethereum Object does not exist');
    } catch (err) {
      console.log(err);
    }
  }

  const transferInput = () => {
    return (
      <InputForm label="Transfer Input Select" inputs={[0,1,2,3,4,5,6]} handleChange={handleTransferInputChange} />
    )
  }

  const transferOutput = () => {
    return (
      <InputForm label="Transfer Output Select" inputs={[0,1,2]} handleChange={handleTransferOutputChange} />
    )
  }

  const transferButton = () => {
    return (
      <InputButton2 label="Transfer" className="cta-button transfer-button" handleClick={transferHandler} inputValue={inputTransferValue} outputValue={outputTransferValue} />
    )
  }
  const transferLayout = () => {
    return (
      <div className="token-section">
        <h2 className='token-title'>
          Transfers
        </h2>
        {transferInput()}
        {transferOutput()}
        {transferButton()}
      </div>
    )
  }


  // get MATIC balance
  const [ethBalance, setEthBalance] = useState(0);
  
  const fetchETHBalance = async () => {
    try {
      if (currentWallet) {
        let ethBalance = ethers.utils.formatEther(await (await alchemy.core.getBalance(currentWallet.address)).toString());
        ethBalance = Math.round(ethBalance * 1e4) / 1e4;
        setEthBalance(ethBalance);
      }
    } catch (err) {
      console.log(err);
    }
  }

  const displayETHLayout = () => {
    return (
      <div className='balance eth-balance'>
        <h2>ETH Balance -- {ethBalance}</h2>
      </div>
    )
  }


  // Get Token Balances
  const [balance0, setBalance0] = useState(0);
  const [balance1, setBalance1] = useState(0);
  const [balance2, setBalance2] = useState(0);
  const [balance3, setBalance3] = useState(0);
  const [balance4, setBalance4] = useState(0);
  const [balance5, setBalance5] = useState(0);
  const [balance6, setBalance6] = useState(0);

  const fetchTokenBalances = async () => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
        const addr = await signer.getAddress();

        let b0 = await tokenContract.balanceOf(addr, 0);
        setBalance0(b0.toString());

        let b1 = await tokenContract.balanceOf(addr, 1);
        setBalance1(b1.toString());

        let b2 = await tokenContract.balanceOf(addr, 2);
        setBalance2(b2.toString());

        let b3 = await tokenContract.balanceOf(addr, 3);
        setBalance3(b3.toString());

        let b4 = await tokenContract.balanceOf(addr, 4);
        setBalance4(b4.toString());

        let b5 = await tokenContract.balanceOf(addr, 5);
        setBalance5(b5.toString());

        let b6 = await tokenContract.balanceOf(addr, 6);
        setBalance6(b6.toString());

      } else console.log('Ethereum Object does not exist');
    } catch (err) {
      console.log(err);
    }
  }

  const displayBalanceLayout = (bal, index) => {
    return (
      <div className='balance token-balance'>
        <h2> Token {index} Balance -- {bal}</h2>
      </div>
    )
  } 


  const tokenLayout = () => {
    return (
      <div className='token-display'>
        <div className="token-container">
          {starterLayout()}
          {higherLayout()}
          {transferLayout()}
        </div>
        <div className="token-container">
          {displayETHLayout()}
          {displayBalanceLayout(balance0, 0)}
          {displayBalanceLayout(balance1, 1)}
          {displayBalanceLayout(balance2, 2)}
          {displayBalanceLayout(balance3, 3)}
          {displayBalanceLayout(balance4, 4)}
          {displayBalanceLayout(balance5, 5)}
          {displayBalanceLayout(balance6, 6)}
        </div>
      </div>
    )
  }

  useEffect(() => {
    fetchETHBalance();
    fetchTokenBalances();
  }, [
    currentWallet,
    inputStarterValue, 
    inputHigherValue, 
    inputTransferValue, 
    outputTransferValue,
    ethBalance,
    balance0,
    balance1,
    balance2,
    balance3,
    balance4,
    balance5,
    balance6
  ])

  return (
    <div className="App">
      <h1 className="title-text">Welcome to the Forge!</h1>
      <div>
        {createWalletStarter()}
        {currentWallet ? tokenLayout() : null}
      </div>
    </div>
  );
}

export default App;
