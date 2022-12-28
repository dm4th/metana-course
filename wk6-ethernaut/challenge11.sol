// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IElevator {
    function goTo(uint _floor) external;
}

contract Building {

    uint256 calls;

    constructor() {
        calls = 0;
    }

    function isLastFloor(uint _floor) public returns(bool) {
        calls ++;
        if(calls % 2 == 1) return false;
        else return true;
    }

    function callElevator(address _elevator, uint _floor) public {
        IElevator(_elevator).goTo(_floor);
    }
}