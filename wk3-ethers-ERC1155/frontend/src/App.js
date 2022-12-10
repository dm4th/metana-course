import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import './App.css';
import { InputForm } from './components/InputForm';
import { InputButton } from './components/InputButton';

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
    console.log(inVal.target.value);
  }

  const mintStarterHandler = async (value) => { 
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const logicContract = new ethers.Contract(address, abi, signer);

        console.log(`Minting Starter: ${Number(value)}`);
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
        {mintStarterInput()}
        {mintStarterButton()}
        {burnStarterButton()}
      </div>
    )
  }

  const mint3Handler = () => { }

  const mint4Handler = () => { }

  const mint5Handler = () => { }

  const mint6Handler = () => { }

  const transferHandler = () => { }
  
  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <h1 className="title-text">Welcome to the Forge!</h1>
      <div>
        {currentAccount ? starterLayout() : connectWalletButton()}
      </div>
    </div>
  );
}

export default App;
