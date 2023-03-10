# Side-Entrance

The key to solving this puzzle is realizing that there's no check on not being able to deposit Ether using the flash loan functionality. Because the Flash loan just checks the contract balance and the deposit function is payable we can: 
1. Take a flash loan for the whole pool amount
2. Call Deposit with that ether -- this is essentially paying back the flash loan while also incrementing our balance
3. Call withdraw from our contract after the flash loan is over now that our balance == the pool's whole balance
4. Send the ether from the attack contract to our player address