const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// helper function to generate a random number
function getRandomInt(max_value) {
  return Math.floor(Math.random() * max_value);
}

describe("BitWise", function () {
  
  async function deployBitWise() {
    const [owner] = await ethers.getSigners();

    const BitWiseFactory = await ethers.getContractFactory("BitWise");
    const BitWise = await BitWiseFactory.deploy();

    return { BitWise, owner };
  }

  describe("Specific Test Cases", function () {

    it("Should return the same value for 0", async function () {
      const { BitWise, owner } = await loadFixture(deployBitWise);
      const val = 0;
      const norm = await BitWise.connect(owner).countBitSet(val);
      const asm = await BitWise.connect(owner).countBitSetAsm(val);

      expect(norm).to.equal(asm);
    });

    it("Should return the same value for 1", async function () {
      const { BitWise, owner } = await loadFixture(deployBitWise);
      const val = 1;
      const norm = await BitWise.connect(owner).countBitSet(val);
      const asm = await BitWise.connect(owner).countBitSetAsm(val);

      expect(norm).to.equal(asm);
    });
    
    it("Should return the same value for 7", async function () {
      const { BitWise, owner } = await loadFixture(deployBitWise);
      const val = 7;
      const norm = await BitWise.connect(owner).countBitSet(val);
      const asm = await BitWise.connect(owner).countBitSetAsm(val);

      expect(norm).to.equal(asm);
    });

  });

  describe("Random Numbers", function () {
    
    it("Should return the same value for 10 randomly generated numbers", async function () {
      const { BitWise, owner } = await loadFixture(deployBitWise);
      for (var i = 0; i < 10; i++) {
        let val = getRandomInt(255);
        let norm = await BitWise.connect(owner).countBitSet(val);
        let asm = await BitWise.connect(owner).countBitSetAsm(val);
        expect(norm).to.equal(asm);
      }
    });

  });

});
