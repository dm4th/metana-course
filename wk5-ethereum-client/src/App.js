import './App.css';
import ERC20Graph from './components/erc20Graph';
import BlockInput from './components/blockInput';
import { useEffect, useState } from 'react';
const { Network, Alchemy } = require("alchemy-sdk");



function App() {

  const settings = {
    apiKey: process.env.REACT_APP_ALCHEMY_KEY,
    network: Network.MATIC_MAINNET
  };
  const alchemy = new Alchemy(settings);

  const[maxBlocks, setMaxBlocks] = useState(10);
  const handleMaxBlocksChange = (val) => {
    setMaxBlocks(val);
  }

  useEffect(() => {
    handleMaxBlocksChange(10);
  }, []);

  return (
    <div className="App">
      <BlockInput maxBlocks={maxBlocks} onBlocksChange={handleMaxBlocksChange} />
      <ERC20Graph alchemy={alchemy} maxBlocks={maxBlocks} />
    </div>
  );
}

export default App;
