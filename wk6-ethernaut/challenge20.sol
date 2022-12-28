// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DenialStopper {

    uint256 public counter;

    constructor() {
        counter = 0;
    }

    fallback() external payable {
        while(true) {
            counter++;
        }
    }
}
