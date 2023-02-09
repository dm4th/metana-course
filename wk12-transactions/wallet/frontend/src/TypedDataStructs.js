import React from 'react';

export const mintStarterTypedData = {
  types: {
    EIP721Domain: [
      {name: 'name', type: 'string'},
      {name: 'version', type: 'string'},
      {name: 'chainId', type: 'uint256'},
      {name: 'verifyingContract', type: 'address'},
    ],
    
  }
}