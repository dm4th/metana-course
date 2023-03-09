# Unstoppable

This is legit a one line solution. All you have to do is transfer DVT tokens to the vault to mess up the internal accounting mechanisms. The Vault expects users to 'deposit' tokens so it can keep track of the fees it needs for loans, but just using the ERC20 transfer function bypasses this and messes it all up.
