# Ethernaut Problem 14

The solution comes down to crossing 3 gates:
- Gate 1: msg.sender cannot be tx.origin --> need to call the gate enter function from another contract
- Gate 2: extcodesize of the caller must be 0 --> Need to call the enter function from the constructor in the other contract
- Gate 3: The key is XOR'd with the keccak256 of the abi encoded value of the calling contract and must equal the max uint256 value --> To reverse this, XOR the keccak256 of the abi encoded contract address with the max int, so that the XOR on the other end of the equation will evaluate to all 1's in binary (and also cast to bytes 8).