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

        bytes memory output;

        assembly{
            output := mload(0x40)                       // load free memory pointer
            let stringLength := mload(input)            // returns number of bytes in the input (first byte is the length in bytes)
            let _input := mload(sub(output, 0x20))      // the input value is going to be one slot before 
                                                        // the free memory pointer because of how it's passed in to the function

            switch lt(stringLength, index)
            // index is beyond the length of the string, return 0
            case 1 {
                mstore(output, 0)
            }
            // can return a value
            default {
                _input := shl(mul(8,index), _input)     // Shift input 2 bytes (8 bits) to the left for each index value

                mstore(output, and(_input,0xff00000000000000000000000000000000000000000000000000000000000000))  // just store the first 2 bytes
            }
            
            return(output, 32)

        }

   }

}