// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract SelfDestructor {
function initialize() external {
        selfdestruct(payable(msg.sender));
    }
}