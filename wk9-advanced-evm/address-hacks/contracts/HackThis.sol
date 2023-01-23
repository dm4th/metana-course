// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";

// Author: @dm4th

/**
 * @dev Collection of Contracts to demoonstrate the constructor vulnerability in Openzepplin's Address util constructor
 */

contract HackThis {
    /**
    * @dev this is the contract to be hacked
    */

    using Address for address;

    constructor() {  }

    function attemptHack() public view returns(bool){
        /**
        * @dev this is the function that allows hacking through the constructor exploit
        */

        require(msg.sender.isContract() == false, "Must be an EOA to hack me :)");
        return true;
    }

    function protectedAttemptHack() public view returns(bool){
        /**
        * @dev this is the function that allows hacking through the constructor exploit
        */

        require(msg.sender.isContract() == false, "Must be an EOA to hack me :)");
        require(msg.sender == tx.origin, "Must hack this function directly :)");
        return true;
    }
}