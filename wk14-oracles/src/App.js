import './App.css';
import { useEffect, useState } from 'react';
import { Network, Alchemy, Wallet, Utils } from 'alchemy-sdk';
import { ethers } from 'ethers';

import PairInput from './contracts/components/PairInput';
import PairGraph from './contracts/components/PairGraph';

import aggregatorV3InterfaceABIFile from './contracts/aggregatorV3InterfaceABI';

const priceFeeds = {
  'BTC/USD': '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
  'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  'MATIC/USD': '0x7bAC85A8a13A4BcD8abb3eB7d6b4d632c5a57676',
  'SOL/USD': '0x4ffC43a60e009B551865A93d232E33Fce9f01507',
  'ATOM/USD': '0xDC4BDB458C6361093069Ca2aD30D74cc152EdC75',
  'DOT/USD': '0x1C07AFb8E2B827c5A4739C6d59Ae3A5035f28734',
  'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9',
  'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
  'USDT/USD': '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
  'FRAX/USD': '0xB9E1E3A9feFf48998E45Fa90847ed4D467E8BcfD',
  'COMP/USD': '0xdbd020CAeF83eFd542f4De03e3cF0C28A4428bd5',
  'UNI/USD': '0x553303d460EE0afB37EdFf9bE42922D8FF63220e',
  'SUSHI/USD': '0xCc70F09A6CC17553b2E31954cD36E4A2d89501f7',
  'CRV/USD': '0xCd627aA160A6fA45Eb793D19Ef54f5062F20f33f',
  'YFI/USD': '0xA027702dbb89fbd58938e4324ac03B58d812b0E1',
  'MKR/USD': '0xec1D1B3b0443256cc3860e24a46F108e699484Aa',
  'ENS/USD': '0x5C00128d4d1c2F4f652C267d7bcdD7aC99C16E16',
  'LINK/USD': '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c',

  'BTC/ETH': '0xdeb288F737066589598e9214E782fa5A8eD689e8',
  'ATOM/ETH': '0x15c8eA24Ba2d36671Fa22aD4Cff0a8eafe144352',
  'DAI/ETH': '0x773616E4d11A78F511299002da57A0a94577F1f4',
  'USDC/ETH': '0x986b5E1e1755e3C2440e960477f25201B0a8bbD4',
  'USDT/ETH': '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
  'FRAX/ETH': '0x14d04Fff8D21bd62987a5cE9ce543d2F1edF5D3E',
  'COMP/ETH': '0x1B39Ee86Ec5979ba5C322b826B3ECb8C79991699',
  'UNI/ETH': '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e',
  'SUSHI/ETH': '0xe572CeF69f43c2E488b33924AF04BDacE19079cf',
  'CRV/ETH': '0x8a12Be339B0cD1829b91Adc01977caa5E9ac121e',
  'YFI/ETH': '0x7c5d4F8345e66f68099581Db340cd65B078C41f4',
  'MKR/ETH': '0x24551a8Fb2A7211A25a17B1481f043A8a8adC7f2',
  'LINK/ETH': '0xDC530D9457755926550b59e8ECcdaE7624181557'
};

const timeSelections = {
  '12H': 43200000,
  '1D': 86400000,
  '7D': 604800000,
  '1M': 2629800000,
  '3M': 7889400000,
  '1Y': 31557600000,
  '5Y': 157788000000
};

const axisSelections = [
  'Dual Axis',
  'Same Axis'
];

const alchemySettings = {
  apiKey: process.env.REACT_APP_ALCHEMY_KEY,
  network: Network.ETH_MAINNET
};

const INITIAL_PAIR_1 = 'BTC/USD';
const INITIAL_PAIR_2 = 'ETH/USD';
const INITIAL_TIME = '1D';
const INITIAL_AXIS = 'Dual Axis';
const aggregatorV3InterfaceABI = aggregatorV3InterfaceABIFile.abi;

function App() {

  const alchemy = new Alchemy(alchemySettings);
  
  // handle taking chart inputs from user
  const [pair1, setPair1] = useState(INITIAL_PAIR_1);
  const [pair2, setPair2] = useState(INITIAL_PAIR_2);
  const [addr1, setAddr1] = useState(priceFeeds[INITIAL_PAIR_1]);
  const [addr2, setAddr2] = useState(priceFeeds[INITIAL_PAIR_1]);
  const [timePeriod, setTimePeriod] = useState(INITIAL_TIME);
  const [timePeriodMilli, setTimePeriodMilli] = useState(timeSelections[INITIAL_TIME]);
  const [dualAxis, setDualAxis] = useState(INITIAL_AXIS);

  const handlePair1Change = async (newPair) => {
    await setPair1(newPair);
    await setAddr1(priceFeeds[newPair]);
  }

  const handlePair2Change = async (newPair) => {
    await setPair2(newPair);
    await setAddr2(priceFeeds[newPair]);
  }

  const handleTimeChange = async (newTime) => {
    await setTimePeriod(newTime);
    await setTimePeriodMilli(timeSelections[newTime]);
    console.log(timePeriod);
  }

  const handleAxisChange = async (newAxis) => {
    await setDualAxis(newAxis);
    console.log(dualAxis);
  }


  // Handle getting historical price feed data
  const [aggContract1, setAggContract1] = useState(null);
  const [aggContract2, setAggContract2] = useState(null);
  const [xAxis1, setXAxis1] = useState([]);
  const [xAxis2, setXAxis2] = useState([]);
  const [yAxis1, setYAxis1] = useState([]);
  const [yAxis2, setYAxis2] = useState([]);
  
  const connectAggContract = async (isPair1) => {
    const provider = await alchemy.config.getProvider();
    if (isPair1) {
      await setAggContract1(new ethers.Contract(addr1, aggregatorV3InterfaceABI, provider));
    } else {
      await setAggContract2(new ethers.Contract(addr2, aggregatorV3InterfaceABI, provider));
    }
  }

  const retrievePriceData = async (isPair1) => {
    // first retrieve the decimal data
    let aggContract;
    if (isPair1) {
      aggContract = aggContract1;
    } else {
      aggContract = aggContract2;
    }
    const decimals = await aggContract.decimals();

    // retrieve the latest round data
    let latestRound = await aggContract.latestRoundData();
    let answer = ethers.utils.formatUnits(ethers.BigNumber.from(latestRound.answer), decimals);
    let roundId = ethers.BigNumber.from(latestRound.roundId);
    let timestamp = new Date(ethers.BigNumber.from(latestRound.updatedAt).toNumber() * 1000);

    // retrive phaseId and aggRoundId
    let phaseId = roundId.shr(64);
    let aggRoundId = roundId.mask(64);
    let x_axis = [timestamp];
    let y_axis = [answer];

    // loop over historical rounds to get historical prices
    let lastTime = new Date().getTime() - timePeriodMilli;
    while (timestamp > lastTime) {
      aggRoundId--;
      // check if we need to go to an earlier aggregator
      if (aggRoundId == 0) {
        phaseId.sub(1);
        aggRoundId = await findMaxRoundId(aggContract, phaseId);
      }
      const validId = phaseId.shl(64).or(aggRoundId);
      const prevRound = await aggContract.getRoundData(validId);
      const newTimestamp = new Date(ethers.BigNumber.from(prevRound.updatedAt).toNumber() * 1000);
      const newAnswer = ethers.utils.formatUnits(ethers.BigNumber.from(prevRound.answer), decimals);
      x_axis.splice(0, 0, newTimestamp);
      y_axis.splice(0, 0, newAnswer);
    }

    console.log(`Is Pair 1: ${isPair1}`);
    console.log(`X: ${x_axis}`);
    console.log(`Y: ${y_axis}`);

    if (isPair1) {
      setXAxis1(x_axis);
      setYAxis1(y_axis);
    } else {
      setXAxis2(x_axis);
      setYAxis2(y_axis);
    }
  }

  const findMaxRoundId = async(contract, phaseId) => {
    let roundId = 1;
    let looping = true;
    while (looping) {
      const validId = phaseId.shl(64).or(roundId);
      try {
        await contract.getRoundData(validId);
        roundId++;
      } catch (err) {
        console.log(err);
        looping = false
      }
    }
    return roundId;
  }




  useEffect(() => {
    connectAggContract(true);
  }, [pair1])

  useEffect(() => {
    connectAggContract(false);
  }, [pair2])

  useEffect(() => {
    retrievePriceData(true);
  }, [aggContract1, timePeriod])

  useEffect(() => {
    retrievePriceData(false);
  }, [aggContract2, timePeriod])

  return (
    <div className="App">
      <h1 className="title-text">Oracle Capstone Project</h1>
      <div className='container'>
        <PairInput 
          selections={priceFeeds}
          timeSelections={timeSelections}
          axisSelections={axisSelections}
          onPair1Change={handlePair1Change} 
          onPair2Change={handlePair2Change} 
          onTimeChange={handleTimeChange} 
          onAxisChange={handleAxisChange} 
          initialPair1={INITIAL_PAIR_1}
          initialPair2={INITIAL_PAIR_2}
          initialTime={INITIAL_TIME}
          initialAxis={INITIAL_AXIS}
        />
        {/* <PairGraph
          pair={currentPair}
          _x={xAxis}
          _y={yAxis}
        /> */}
      </div>
    </div>
  );
}

export default App;
