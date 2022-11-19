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



    describe("Assignment 2: Sanctions", function() {

      it("Should allow for god to add an authority", async function () {
        const { hardhatDM4, addr1 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // Check that addr1 is an authority
        const addr1_auth = await hardhatDM4.authorities(addr1.address);
        expect(addr1_auth).to.equal(true);
      });

      it("Should allow for new authorities to add other authorities", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // addr1 add addr2 as an authority
        await hardhatDM4.connect(addr2);
        await hardhatDM4.connect(addr1).addAuthority(addr2.address);
        // Check that addr2 is an authority
        const addr2_auth = await hardhatDM4.authorities(addr2.address);
        expect(addr2_auth).to.equal(true);
      });

      it("Should not allow for random addresses to add other authorities", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // addr1 add addr2 as an authority without being an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.connect(addr2);
        await expect(
          hardhatDM4.connect(addr1).addAuthority(addr2.address)
          ).to.be.revertedWith("Must become an authority before performing this action!!");
      });

      it("Should not allow for new authorities to remove other authorities", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // addr1 add addr2 as an authority
        await hardhatDM4.connect(addr2);
        await hardhatDM4.connect(addr1).addAuthority(addr2.address);
        // Check that addr2 is an authority
        await expect(
          hardhatDM4.connect(addr1).removeAuthority(addr2.address)
          ).to.be.revertedWith("You do not have the power!!");
      });

      it("Should allow for god to add sanctions", async function () {
        const { hardhatDM4, addr1 } = await loadFixture(deployTokenFixture);
        // add addr1 as a sanction
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addSanction(addr1.address);
        // Check that addr1 is a sanction
        const addr1_auth = await hardhatDM4.sanctioned(addr1.address);
        expect(addr1_auth).to.equal(true);
      });

      it("Should allow for god to remove sanctions", async function () {
        const { hardhatDM4, addr1 } = await loadFixture(deployTokenFixture);
        // add addr1 as a sanction
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addSanction(addr1.address);
        // addr1 remove addr2 as a sanction
        await hardhatDM4.removeSanction(addr1.address);
        // Check that addr1 is no longer a sanction
        const addr1_auth = await hardhatDM4.sanctioned(addr1.address);
        expect(addr1_auth).to.equal(false);
      });

      it("Should allow for new authorities to add sanctions", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // addr1 add addr2 as a sanction
        await hardhatDM4.connect(addr2);
        await hardhatDM4.connect(addr1).addSanction(addr2.address);
        // Check that addr2 is a sanction
        const addr2_auth = await hardhatDM4.sanctioned(addr2.address);
        expect(addr2_auth).to.equal(true);
      });

      it("Should allow for new authorities to remove sanctions", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // addr1 add addr2 as a sanction
        await hardhatDM4.connect(addr2);
        await hardhatDM4.connect(addr1).addSanction(addr2.address);
        // addr1 remove addr2 as a sanction
        await hardhatDM4.connect(addr1).removeSanction(addr2.address);
        // Check that addr2 is no longer a sanction
        const addr2_auth = await hardhatDM4.sanctioned(addr2.address);
        expect(addr2_auth).to.equal(false);
      });

      it("Should not allow for sanctioned addresses to become authorities", async function () {
        const { hardhatDM4, addr1, addr2 } = await loadFixture(deployTokenFixture);
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addAuthority(addr1.address);
        // addr1 add addr2 as a sanction
        await hardhatDM4.connect(addr2);
        await hardhatDM4.connect(addr1).addSanction(addr2.address);
        // Check failure on addr1 add addr2 as a sanction
        await expect(
          hardhatDM4.connect(addr1).addAuthority(addr2.address)
          ).to.be.revertedWith("Cannot make a sanctioned address an authority!!");
      });

      it("Should not allow for sanctioned addresses to receive new tokens", async function () {
        const { hardhatDM4, addr1 } = await loadFixture(deployTokenFixture);
        const mint_value = 50;
        // add addr1 as an authority
        await hardhatDM4.connect(addr1);
        await hardhatDM4.addSanction(addr1.address);
        // Check failure on addr1 mint new tokens
        await expect(
          hardhatDM4.mintTokensToAddress(addr1.address, mint_value)
          ).to.be.revertedWith("VIOLATION!! Cannot transfer to a sanctioned address!");
      });
    });
  });