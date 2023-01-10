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

### Call Data to Send = 0x600060005360016000F3

This one was super difficult to understand... Basically we need to pass calldata for Solidity code that evaluates to 1 byte of storage of code. I wasn't sure how to write Solidity taht would evaluate to just 1 byte, but this article (https://stermi.medium.com/evm-puzzle-7-solution-dd2f3d09186e) helpfully pointed out that we need the code to just be the STOP opcode rather than a fully complied contract. Their walkthrough was helpful to get the final input.

The CREATE call loads the code from memory based on 3 inputs from the stack. The first of which is the value needed to be sent along with contract creation (0), the second is the offset in memory to start reading from to load as code to the contract (also 0) and the third is the size in bytes to read from memory to load as code (CALLDATASIZE). So we need to basically send a contract in bytecode to the contract that will have a codesize of 1 --> returning the STOP opcode works here.

To return just a stop opcode, we actually need the code in the created contract to not just be the STOP opcode, rather we need the code to actually return STOP (opcode 00). To do this we need to load the return value into memory first and then return that value from memory with an offset.

PUSH1 00 // 00 is the opcode for STOP
PUSH1 00 // this will be used as the offset of MSTORE8 that store 1 byte in memory
MSTORE8 // will store in memory from offset 0 the `00` value (from the first PUSH1)
PUSH1 01 // how many bytes must be returned
PUSH1 00 // from which memory offset return those bytes
RETURN

The bytecode for these commands is 0x6000 6000 53 6001 6000 F3 aka the answer to the puzzle.

## Puzzle 8

### Call Data to Send = 0x60FD60005360016000F3

To Solve this puzzle we're going to need to create a contract that evaluates to 0 when called. The previous contract from puzzle 7 evalueates to 1 when called. This is because CALL returns 1 always unless the code in the address being called reverts - in which case it returns 0. This means we need to send calldata for code in a contract that will immediately revert. Similarly to puzzle 7 we need to actually return the REVERT opcode.

PUSH1 FD // FD is the opcode for STOP
PUSH1 00 // this will be used as the offset of MSTORE8 that store 1 byte in memory
MSTORE8 // will store in memory from offset 0 the `00` value (from the first PUSH1)
PUSH1 01 // how many bytes must be returned
PUSH1 00 // from which memory offset return those bytes
RETURN

The bytecode for these commands is 0x60FD 6000 53 6001 6000 F3.

## Puzzle 9

### Value to Send = 2
### Call Data to Send = 0x00000000

This is a bit more like the puzzles before 7 and 8 where we need to send a value and call data combination that will evaluate to the correct logic operations to jump to the correct lines. The first block is lines 0-6, and we will need a CALLDATASIZE vaue of greater than 3 (i.e. the call value needs to be at least 4 bytes). The second block is lines A - 12 where we will need the CALLVALUE * CALLDATASIZE to equal 8.

So we need V * CD = 8 and CD > 3... Luckily 2 x 4 = 8 so we'll pass 2 as the value and 0x00000000 as the call data.

## Puzzle 10

### Value to Send = 15
### Call Data to Send = 0x000000

The first block needs the input value to be less than the code size (1A). The second block needs the call dtaa size to be divisible by 3. The third block needs the call value + 0A to equal 19. Input value of 15 satisfies the first and third blocks, and 3 bytes of input call data satisfies the second.







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
