# Rewarder

The key to solving this puzzle is in the fact that you can deposit liquidity tokens jsut before a snapshot is taken, and then collect reqwards in the same transaction. After waiting for the next round to begin, you need to:
1. Deploy an attack contract - this is important because the flash loan pool is going to require calls from a contract that implements ```receiveFlashLoan(uint256)```
2. Call for a flash loan for the full amount in the pool.
3. In the implementation of ```receiveFlashLoan(uint256)```, deposit all of the tokens into the rewards pool. This will cause the following actions to happen in order:
    1. Increase your balance to the size of the loan pool.
    2. Take a snapshot for rewards on the previous round (very important that this comes after increasing your balance)
    3. Distribute accounting tokens for rewards
4. Now that you've been distributed rewards, withdraw from the rewards pool all of the tokens you just deposited
5. Send the tokens back to the flash pool.

Becuase you messed up the snapshot, none of the other players will be able to get any rewards.