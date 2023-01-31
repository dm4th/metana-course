// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract BitWise {

    // count the number of bit set in data.  i.e. data = 7, result = 3

    function countBitSet(uint8 data) public pure returns (uint8 result) {

        for( uint i = 0; i < 8; i += 1) {

            if( ((data >> i) & 1) == 1) {

                result += 1;

            }

        }

    }

    function countBitSetAsm(uint8 data ) public pure returns (uint8 result) {

        // replace following line with inline assembly code
        assembly {
            result := 0       // result
            
            // loop over each of the 8 bits in uint8
            for { let i := 0}   lt(i, 8) { i:= add(i, 1)} 
            {
                if gt(mod(data, 2), 0) {        // if data mod 2 > 0 then add one to result (is the last bit 1)
                    result := add(result, 1)
                }
                data := div(data, 2)            // basically bitshift data 1 to the right dropping the last bit
            }

        }

        return result;

    }

}