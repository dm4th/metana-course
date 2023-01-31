// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

/**
 * Add following test cases for String contract: 
 * 
 * charAt(“abcdef”, 2) should return 0x6300
 * charAt(“”, 0) should return 0x0000
 * charAt(“george”, 10) should return 0x0000
 */
 
contract String {

   function charAt(string memory input, uint index) public pure returns(bytes2) {

        assembly{

            // add logic here

            // return the character from input at the given 

            // index

            // where index is base 0

        }

   }

}