import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import { InputForm } from './components/InputForm';
import { InputButton, InputButton2 } from './components/InputButton';

// import contract from './contracts/ForgeToken.json';
// tokenAddress = '0xB07093567612D05Ad979bf0495bA724E82C5016C';
// tokenABI = contract.abi;

import contract from './contracts/ForgeLogic.json';
const address = '0x99cC161297D48348f559AE83286aa01986060A62';
const abi = contract.abi;

function App() {

  // connect metamask
  const [currentAccount, setCurrentAccount] = useState(null);
  const checkWalletIsConnected = async () => { 
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Metamask Not Connected");
      return;
    } else console.log("Metamask Connected!!");

    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Connected Account: ", account);
      setCurrentAccount(account);
    } else console.log("No account found...")
  }

  const connectWalletHandler = async () => { 
    const { ethereum } = window;

    if (!ethereum) alert("Install Metamask Before Proceeding");

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected Account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }
  

  // starter section input
  const [inputStarterValue, setStarterValue] = useState('');

  function handleStarterValueChange(inVal) {
    setStarterValue(inVal.target.value);
  }

  const mintStarterHandler = async (value) => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const logicContract = new ethers.Contract(address, abi, signer);

        console.log(`Minting Starter: ${value}`);
        let tx = await logicContract.connect(signer).mintStarter(value);

        console.log(`Minting Now...\nTX: https://polygonscan.com/tx/${tx.hash}`);
        await tx.wait();

        console.log('Done!!')
      } else console.log('Ethereum Object does not exist');
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
    switch(value) {
      case 3: return logicContract.connect(signer).mint3();
      case 4: return logicContract.connect(signer).mint4();
      case 5: return logicContract.connect(signer).mint5();
      case 6: return logicContract.connect(signer).mint6();
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



  const tokenFunctionalityLayout = () => {
    return (
      <div className="token-functions">
        {starterLayout()}
        {higherLayout()}
        {transferLayout()}
      </div>
    )
  }

  
  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <h1 className="title-text">Welcome to the Forge!</h1>
      <div>
        {currentAccount ? tokenFunctionalityLayout() : connectWalletButton()}
      </div>
    </div>
  );
}

export default App;
