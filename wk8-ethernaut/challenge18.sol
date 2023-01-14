// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*

Assembly for Returning the number 42

PUSH (60) 2A
PUSH (60) 00
MSTORE (52)
PUSH (60) 20
PUSH (60) 00
RETURN (F3)

Result Bytecode: 602A60005260206000F3

*/

interface IMagicNum {
    function setSolver(address _solver) external;
}

contract SolverFactory {

    address constant public magicNumAddr = 0x2e18EAB766e7703d61159568a0cA464dF94cBfDA;
    address public solver;

    constructor() {}

    function buildSolver() public {
        // 600a 600c 6000 39 is the setup for CODECOPY command to load the code into memory so we can return later
        // 600a 6000 f3 return the code from memory to run it
        // 602a 6000 52 store the number 42 to memory
        // 6020 6000 f3 return the number 42 from memory
        bytes memory byteCode = hex"600a600c600039600a6000f3602a60005260206000f3";
        address _solver;
        // very confused on this create call -- ask questions about this
        assembly {
            _solver := create(0, add(byteCode, 0x20), mload(byteCode))
        }

        solver = _solver;
        IMagicNum(magicNumAddr).setSolver(solver);
    }
}