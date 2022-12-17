import './App.css';
import ERC20Graph from './components/erc20Graph';
import BlockInput from './components/blockInput';
import GasGraph from './components/gasGraph';
import { useEffect, useState } from 'react';
const { Network, Alchemy } = require("alchemy-sdk");



function App() {

  const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY,
    network: Network.ETH_MAINNET
  };
  const alchemy = new Alchemy(settings);

  const[maxBlocks, setMaxBlocks] = useState(10);
  const handleMaxBlocksChange = (val) => {
    setMaxBlocks(val);
  };

  const [currentBlock, setCurrentBlock] = useState(0);

  const handleBlocksChange = () => {
    console.log(`Opening WebSocket for Block Fees`);
    alchemy.ws.on("block", (result) => {
      setCurrentBlock(result);
    });
  }

  useEffect(() => {
    handleMaxBlocksChange(10);
    handleBlocksChange();
  }, []);

  return (
    <div className="App">
      <h1 className="title">Welcome to the Week 5 - ERC20 & Gas Tracking!</h1>
      <h3 className='block-num'>Current Block: {currentBlock.toLocaleString()}</h3>
      <div className='dashboard'>
        <BlockInput maxBlocks={maxBlocks} onBlocksChange={handleMaxBlocksChange} />
        <ERC20Graph alchemy={alchemy} maxBlocks={maxBlocks} />
        <GasGraph alchemy={alchemy} maxBlocks={maxBlocks} currentBlock={currentBlock} />
      </div>
    </div>
  );
}

export default App;
