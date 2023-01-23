# DamnVulnerableDeFI Problem 3

The key to this problem is that the TrustLendingPool contract calls the bytecode in the data argument on the target contract.
We can use this to approve the transfer of all the tokens in the pool to out attacking contract (and then withdraw those tokens to our own EOA).

Run:

```shell
npx hardhat test
```

to verify the lending pool is hacked