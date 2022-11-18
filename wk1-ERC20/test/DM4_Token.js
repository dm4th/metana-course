const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DM4th Token Contract", function () {

    async function deployTokenFixture() {
        const DM4 = await ethers.getContractFactory("DM4thToken");
        const [owner, addr1, addr2] = await ethers.getSigners();
    
        const hardhatDM4 = await DM4.deploy();
    
        await hardhatDM4.deployed();
    
        return { DM4, hardhatDM4, owner, addr1, addr2 };
      }

    describe("Pre-Check", function() {

      it("Should set the owner to the god address", async function () {
        const { hardhatDM4, owner } = await loadFixture(deployTokenFixture);
        const god_addr = await hardhatDM4._god();
        expect(await hardhatDM4._god()).to.equal(owner.address);
      });
      
      it("Should assign total supply of tokens to the owner", async function () {
        const { hardhatDM4, owner } = await loadFixture(deployTokenFixture);
        const ownerBalance = parseInt(await hardhatDM4.balanceOf(owner.address));
        const total_supply = parseInt(await hardhatDM4.totalSupply());
        expect(total_supply).to.equal(ownerBalance);
      });
    });

    describe("Assignment 1: God Mode", function() {

      it("Should mint tokens to a given address, and increment that address' balance & total supply", async function () {
        const { hardhatDM4, owner, addr1 } = await loadFixture(deployTokenFixture);
        const mint_value = 50;
        // call the mintTokensToAddress function
        await hardhatDM4.connect(addr1);
        await hardhatDM4.mintTokensToAddress(addr1.address, mint_value);
        // Check that addr1 has 50 tokens now
        const addr1_balance = parseInt(await hardhatDM4.balanceOf(addr1.address));
        const ownerBalance = parseInt(await hardhatDM4.balanceOf(owner.address));
        const total_supply = parseInt(await hardhatDM4.totalSupply());
        expect(addr1_balance).to.equal(mint_value);
        expect(total_supply).to.equal(ownerBalance + mint_value);
      });
      
      it("Should change balance of a given address, and reflect that value in the address' balance and total supply", async function () {
        const { hardhatDM4, owner, addr1 } = await loadFixture(deployTokenFixture);

        const new_balance = 100;
        // call the changeBalanceAtAddress function
        await hardhatDM4.connect(addr1);
        await hardhatDM4.changeBalanceAtAddress(addr1.address, new_balance);
        // Check that addr1 has 100 tokens now and total supply has 10100
        const addr1_balance = parseInt(await hardhatDM4.balanceOf(addr1.address));
        const ownerBalance = parseInt(await hardhatDM4.balanceOf(owner.address));
        const total_supply = parseInt(await hardhatDM4.totalSupply());
        expect(addr1_balance).to.equal(new_balance);
        expect(total_supply).to.equal(ownerBalance + new_balance);

        const new_balance2 = 25;
        // call the changeBalanceAtAddress function
        await hardhatDM4.changeBalanceAtAddress(addr1.address, new_balance2);
        // Check that addr1 has 100 tokens now and total supply has 10025
        const addr1_balance2 = parseInt(await hardhatDM4.balanceOf(addr1.address));
        const total_supply2 = parseInt(await hardhatDM4.totalSupply());
        expect(addr1_balance2).to.equal(new_balance2);
        expect(total_supply2).to.equal(ownerBalance + new_balance2);
      });

      it("Should auto-transfer tokens between accounts, and increment both address' balance & total supply", async function () {
        const { hardhatDM4, owner, addr1, addr2 } = await loadFixture(deployTokenFixture);
        const transfer_value = 200;
        // call the mintTokensToAddress function to initally populate addr1
        await hardhatDM4.connect(addr1);
        await hardhatDM4.mintTokensToAddress(addr1.address, transfer_value);
        // transfer those tokens to adress 2 using authoritativeTransferFrom
        await hardhatDM4.connect(addr2);
        await hardhatDM4.authoritativeTransferFrom(addr1.address, addr2.address, transfer_value);
        // Check that addr1 has 0 tokens, addr2 has 200 tokens, and total supply is 200 greater
        const addr1_balance = parseInt(await hardhatDM4.balanceOf(addr1.address));
        const addr2_balance = parseInt(await hardhatDM4.balanceOf(addr2.address));
        const ownerBalance = parseInt(await hardhatDM4.balanceOf(owner.address));
        const total_supply = parseInt(await hardhatDM4.totalSupply());
        expect(addr1_balance).to.equal(0);
        expect(addr2_balance).to.equal(transfer_value);
        expect(total_supply).to.equal(ownerBalance + transfer_value);
      });
    });
  });