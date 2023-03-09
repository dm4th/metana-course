# Naive Receiver

The solution to this one boils down to the fact that the receiver contract allows anyone to call a loan on it's behalf and it will always pay the loan fee regardless of how much ETH it borrrowed or what it did.


To drain the contract in one transaction - create an attack contract that:
1. Checks the balance of the receiver
2. Calls a flashLoan on the pool with 0 amount on behalf of the receiver
3. Repeat steps 1 & 2 until the contract has no ETH left