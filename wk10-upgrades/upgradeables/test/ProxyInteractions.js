const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Proxy Deployment & Interactions", function () {
  async function deployContractsFixture() {
    const [owner, addr1, addr2 ] = await ethers.getSigners();

    // deploy ERC20 proxy
    const DM4 = await ethers.getContractFactory("DM4thToken");
    const dm4 = await upgrades.deployProxy(DM4, ["DM4th", "DM4"], { initializer: "initialize" });

    // deploy ERC721 proxy
    const WNE = await ethers.getContractFactory("WinnieNFT");
    const wne = await upgrades.deployProxy(WNE, ["Winnie", "WNE"], { initializer: "initialize" });

    // deploy Minter proxy
    const PPL = await ethers.getContractFactory("PetcoParkingLot");
    const ppl = await upgrades.deployProxy(PPL, [dm4.address, wne.address], { initializer: "initialize" });

    // Upgrade the minter addresses on each of the ERC20 and ERC721 contracts
    await dm4.connect(owner).changeMinter(ppl.address);
    await wne.connect(owner).changeMinter(ppl.address);

    return { ppl, dm4, wne, owner, addr1, addr2 };
  }

  async function mintTokensFixture() {
    const { ppl, dm4, wne, owner, addr1, addr2 } = await loadFixture(deployContractsFixture);

    // mint 20 ERC20 tokens to addr1 and addr2
    const mintVal = ethers.BigNumber.from("20000000000000000000")
    await dm4.connect(owner).mintTokensToAddress(addr1.address, mintVal);
    await dm4.connect(owner).mintTokensToAddress(addr2.address, mintVal);

    // have addr1 and addr2 each mint an NFT
    await dm4.connect(addr1).approve(ppl.address, mintVal);
    await dm4.connect(addr2).approve(ppl.address, mintVal);
    expect(await ppl.connect(addr1).buyNFT()).to.emit(ppl, 'BuyNFT');
    expect(await ppl.connect(addr2).buyNFT()).to.emit(ppl, 'BuyNFT');

    return { ppl, dm4, wne, owner, addr1, addr2 }
  }

  describe("Deployment Check", function () {

    it("Should set the owner of each contract to the same address", async function () {
      const { ppl, dm4, wne, owner } = await loadFixture(deployContractsFixture);
      expect(await dm4.owner()).to.equal(owner.address);
      expect(await wne.owner()).to.equal(owner.address);
      expect(await ppl.owner()).to.equal(owner.address);
    });
    
    it("Should set the minter on the ERC20 & ERC721 to the Minter Address", async function () {
      const { ppl, dm4, wne } = await loadFixture(deployContractsFixture);
      expect(await dm4._minter()).to.equal(ppl.address);
      expect(await wne._minter()).to.equal(ppl.address);
    });
    
  });

  describe("Upgrade Check", function () {

    it("Should have 10 ERC20s and 1 NFT for each of addr1 and addr2 on previous version of the contract", async function () {
      const { ppl, dm4, wne, owner, addr1, addr2 } = await loadFixture(mintTokensFixture);

      const checkVal = ethers.BigNumber.from("10000000000000000000");
      expect(await dm4.connect(addr1).balanceOf(addr1.address)).to.equal(ethers.utils.formatUnits(checkVal,"wei"));
      expect(await dm4.connect(addr2).balanceOf(addr2.address)).to.equal(ethers.utils.formatUnits(checkVal,"wei"));
      
      expect(await wne.connect(addr1).balanceOf(addr1.address)).to.equal(1);
      expect(await wne.connect(addr2).balanceOf(addr2.address)).to.equal(1);
    });

    it("Should upgrade the NFT contract and allow for a forceTransfer of addr1 NFT --> addr2", async function () {
      const { ppl, dm4, wne, owner, addr1, addr2 } = await loadFixture(mintTokensFixture);

      // upgrade the NFT and control contracts
      const proxy_wne = wne.address;
      const WNEV2 = await ethers.getContractFactory("WinnieNFTV2");
      const wneV2 = await upgrades.upgradeProxy(proxy_wne, WNEV2);

      // force transfer token ID 0 from addr1 to addr2
      await wneV2.connect(owner).forceTransfer(0, addr2.address);
      expect(await wneV2.connect(addr1).balanceOf(addr1.address)).to.equal(0);
      expect(await wneV2.connect(addr2).balanceOf(addr2.address)).to.equal(2);
    });
    
  });
});
