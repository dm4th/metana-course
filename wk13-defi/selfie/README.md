# Damn Vulnerable DeFi - Selfie

- Create an attack contract that implements IERC3156FlashBorrower
- In the "onFlashLoan" function, submit a governance proposal to execute "emergencyExit" with the player address as input
- Sumbit a transaction with the max flash loan amount to the SelfiePool contract, with a payload of the call data needed to execute the "emergencyExit" function witha  target of the pool contract
- Let 2 days pass
- Execute the governance proposal and profit