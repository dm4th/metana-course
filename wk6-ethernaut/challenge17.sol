// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISimpleToken {
    function transfer(address _to, uint _amount) external;
    function destroy(address payable _to) external;
}

contract Destroyer is Ownable{

    constructor() {}

    function triggerDestroy(address _simpleToken) public onlyOwner {
        ISimpleToken(_simpleToken).destroy(payable(msg.sender));
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}