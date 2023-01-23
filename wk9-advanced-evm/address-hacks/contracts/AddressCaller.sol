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

contract AddressCaller {
    /**
    * @dev this is the contract we'll use to demonstrate normal functionality for the address util contract at openzepplin
    */

    using Address for address;
    address public hackThisAddr;

    /**
     * @dev pass the address of the HackThis contract for later use
     */
    constructor(address _hackThisAddr) { 
        hackThisAddr = _hackThisAddr;
    }

    /**
     * @dev function to call the attemptHack function on the HackThis contract to demonstrates that it normally works
     */
    function tryHackThis() public returns(bool) {
        return IHackThis(hackThisAddr).attemptHack();
    }

    /**
     * @dev function to call the protectedAttemptHack function on the HackThis contract to demonstrates that it normally works
     */
    function tryProtectedHackThis() public returns(bool) {
        return IHackThis(hackThisAddr).protectedAttemptHack();
    }
}