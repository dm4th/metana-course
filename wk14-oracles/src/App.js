import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import PairInput from './contracts/components/PairInput';
import PairGraph from './contracts/components/PairGraph';

import aggregatorV3InterfaceABIFile from './contracts/aggregatorV3InterfaceABI';

const priceFeeds = {
  'BTC/ETH': '0x779877A7B0D9E8603169DdbD7836e478b4624789',
  'BTC/USD': '0xA39434A63A52E749F02807ae27335515BA4b07F7',
  'ETH/USD': '0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e',
  'DAI/USD': '0x0d79df66BE487753B02D015Fb622DED7f0E9798d',
  'USDC/USD': '0xAb5c49580294Aff77670F839ea425f5b78ab3Ae7',
}

const INITIAL_PAIR = 'BTC/ETH';
const INITIAL_ROUNDS = 10;
const aggregatorV3InterfaceABI = aggregatorV3InterfaceABIFile.abi;

function App() {

  // connect to metamask account that will make smart contract calls
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);

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

      await connectWallet(ethereum, account);

    } else {
      console.log("No account found...");
      await setWallet(null);
      await setSigner(null);
    }
  }

  const connectWalletHandler = async () => { 
    const { ethereum } = window;

    if (!ethereum) alert("Install Metamask Before Proceeding");

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Connected Account: ", accounts[0]);

      await connectWallet(ethereum, accounts[0]);

    } catch (err) {
      console.log(err);
      await setWallet(null);
      await setSigner(null);
    }
  }

  const connectWallet = async (ethereum, account) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const tempSigner = provider.getSigner();
    await setWallet(account);
    await setSigner(tempSigner);
  }
  

  const [currentPair, setCurrentPair] = useState(INITIAL_PAIR);
  const [aggAddr, setAggAddr] = useState(priceFeeds[INITIAL_PAIR]);
  const [historicalRounds, setHistoricalRounds] = useState(INITIAL_ROUNDS);

  const handlePairChange = (newPair) => {
    setCurrentPair(newPair);
    setAggAddr(priceFeeds[newPair]);
  }

  const handleRoundsChange = (newRounds) => {
    setHistoricalRounds(newRounds);
  }


  // Handle getting historical price feed data
  const [aggContract, setAggContract] = useState(null);
  const [xAxis, setXAxis] = useState([]);
  const [yAxis, setYAxis] = useState([]);
  
  const connectAggContract = async () => {
    if (signer) {
      await setAggContract(new ethers.Contract(aggAddr, aggregatorV3InterfaceABI, signer));
    } else {
      await setAggContract(null);
    }
  }

  const retrievePriceData = async () => {
    // first retrieve the decimal data
    const decimals = await aggContract.decimals();
    const decimalsDiv = ethers.BigNumber.from('1' + '0'.repeat(decimals));

    // retrieve the latest round data
    const latestRound = await aggContract.latestRoundData();
    const answer = ethers.BigNumber.from(latestRound.answer).div(decimalsDiv);
    console.log(answer);
    const roundId = ethers.BigNumber.from(latestRound.roundId);
    const timestamp = ethers.BigNumber.from(latestRound.updatedAt);

    // retrive phaseId and aggRoundId
    let phaseId = roundId.shr(64);
    let aggRoundId = roundId.mask(64);

    // loop over historical rounds to get historical prices
    let x_axis = [timestamp];

    let y_axis = [answer];
    for (let i=0; i<historicalRounds-1; i++) {
      aggRoundId--;
      if (aggRoundId > 0) {
        const validId = phaseId.shl(64).or(aggRoundId);
        const prevRound = await aggContract.getRoundData(validId);
        const newTimestamp = ethers.BigNumber.from(prevRound.updatedAt);
        const newAnswer = ethers.BigNumber.from(prevRound.answer).div(decimalsDiv);
        x_axis.splice(0, 0, newTimestamp);
        y_axis.splice(0, 0, newAnswer);
      }
    }

    // console.log(`X: ${x_axis}`);
    // console.log(`Y: ${y_axis}`);
    setXAxis(x_axis);
    setYAxis(y_axis);
  }





  const connectWalletButton = () => {
    return (
      <div className='connect-div'>
        <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
          Connect Wallet
        </button>
        <p className='connect-message'>
          Connect wallet to be able to display oracle outputs. This will require LINK tokens on the Goerli test network
        </p>
      </div>
    )
  }

  const walletConnected = () => {
    return (
      <div className='wallet-connected'>
        <PairInput 
          selections={priceFeeds} 
          onPairChange={handlePairChange} 
          onRoundsChange={handleRoundsChange} 
          initialPair={INITIAL_PAIR}
          initialRounds={INITIAL_ROUNDS}
        />
        <PairGraph
          pair={currentPair}
          _x={xAxis}
          _y={yAxis}
        />
      </div>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [wallet])

  useEffect(() => {
    connectAggContract();
  }, [wallet, currentPair])

  useEffect(() => {
    retrievePriceData();
  }, [aggContract, historicalRounds])

  return (
    <div className="App">
      <h1 className="title-text">Oracle Capstone Project</h1>
      <div>
        {wallet ? walletConnected() : connectWalletButton()}
      </div>
    </div>
  );
}

export default App;
