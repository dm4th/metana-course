const address = '0x9d37668eeE2EEf278F5C9EaD0213f88d7B2b4415';

// Message Types Building Block
export const msgTypes = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  mintStarter: [
    { name: 'id', type: 'uint256' }
  ],
  burnToken: [
    { name: 'id', type: 'uint256' }
  ],
  transferToken: [
    { name: 'from', type: 'uint256' },
    { name: 'to', type: 'uint256' }
  ],
  mint3: [],
  mint4: [],
  mint5: [],
  mint6: []
}

// Domain Separator for Message Signing
export const domainData = {
  name: "DM4th Forge",
  version: "1",
  chainId: 5,   // Goerli Chain ID
  verifyingContract: address
}