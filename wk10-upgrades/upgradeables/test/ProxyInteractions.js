const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Proxy Deployment & Interactions", function () {
  async function deployContractsFixture() {
    const [owner] = await ethers.getSigners();

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

    return { ppl, dm4, wne, owner };
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
});
