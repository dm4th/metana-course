# Solutions to Puzzles

## Puzzle 1

### Value to Send = 8 

Need to provide the value read into the CALLVALUE line (00) to be read in the JUMP line (01). The Jump will jump to the program counter value denoted by the first value in the stack (provided by the CALLVALUE line), which in this case needs to be 8 to correspond with the JUMPDEST line before returning.

## Puzzle 2

### Value to Send = 4

Similarly to puzzle 1, we need the top of the stack value to be 6 when we call JUMP in line 3. The CALLVALUE line (00) takes the input value and pushes it to the stack. The CODESIZE call (01) returns the number of lines in the code and pushes that to the top of the stack. The SUB call takes the top 2 values in the stack (from the previous two lines in this case), subtracts the second from the first, and pushes that value to the stack. So we need ```CODEZISE - CALLVALUE = 6``` where codesize = 10 --> call value of 4.

## Puzzle 3

### Value to Send = 1048576

Here we need the JUMP to call the value 4, and the value at the top of the stack will be the size of the input value in bytes. The CALLDATASIZE funciton seems to actually return the size - 1 for some reason, so we need to input a number that takes up 5 bytes. 2^20 = 1048576

## Puzzle 4

### Value to Send = 6

Here we need to provide the bitwise XOR with 12 (CODESIZE) that will provide 10. 12 in binary is 1100, and 10 is 1010. To get the value we need we need XOR(1100, Q) = 1010 --> Q = 0110 or 6.

## Puzzle 5

### Value to Send = 16

So we need the output value to equal 12 to complete the JUMP call correctly,  but we push 12 onto the stack right before that call. All we need is to pass the EQ call in line 6 to make sure we pass the equivalence check in JUMPI (second point in stack needs to be TRUE). 
The first 3 lines take the input, duplicate that input, and multiply them together, effectively squaring out input. The next PUSH2 call pushes the number '0100' or '256' to the stack. Finally we check the equivalence. So we need to solve Q^2 = 256 --> Q = 16

## Puzzle 6

### Value to Send = 0x000000000000000000000000000000000000000000000000000000000000000a

We need to pass the value 10 thru the call data to get the jump counter correct. Call data expects 2 characters in HEX per byte of call data, and we need 32 bytes (so 63 0s followed by a).

## Puzzle 7

### Value to Send = 0x600060005360016000F3

This one was super difficult to understand... Basically we need to pass calldata for Solidity code that evaluates to 1 byte of storage of code. I wasn't sure how to write Solidity taht would evaluate to just 1 byte, but this article (https://stermi.medium.com/evm-puzzle-7-solution-dd2f3d09186e) helpfully pointed out that we need the code to just be the STOP opcode rather than a fully complied contract. Their walkthrough was helpful to get the final input.

## Puzzle 8

### Value to Send = 

To Solve this puzzle we're going to need to create a contract that evaluates to FALSE when called. The previous contract from puzzle 7 evalueates to TRUE when called (it completes successfully).







# EVM puzzles -- Old README Starts Here

A collection of EVM puzzles. Each puzzle consists on sending a successful transaction to a contract. The bytecode of the contract is provided, and you need to fill the transaction data that won't revert the execution.

## How to play

Clone this repository and install its dependencies (`npm install` or `yarn`). Then run:

```
npx hardhat play
```

And the game will start.

In some puzzles you only need to provide the value that will be sent to the contract, in others the calldata, and in others both values.

You can use [`evm.codes`](https://www.evm.codes/)'s reference and playground to work through this.
