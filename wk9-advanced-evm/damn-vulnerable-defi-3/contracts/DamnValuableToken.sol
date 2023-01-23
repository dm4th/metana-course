// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// Code from: https://github.com/tinchoabbate/damn-vulnerable-defi/blob/v3.0.0/contracts/DamnValuableToken.sol

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title DamnValuableToken
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract DamnValuableToken is ERC20 {
    constructor() ERC20("DamnValuableToken", "DVT") {
        _mint(msg.sender, type(uint256).max);
    }
}