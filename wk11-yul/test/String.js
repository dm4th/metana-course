const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("String", function () {
  
  async function deployStrings() {
    const [owner] = await ethers.getSigners();

    const StringFactory = await ethers.getContractFactory("String");
    const String = await StringFactory.deploy();

    return { String, owner };
  }

  describe("Specific Test Cases", function () {

    it("Should return 0x6300 for 'abcdef' with index 2", async function () {
      const { String, owner } = await loadFixture(deployStrings);
      const inputString = "abcdef";
      const inputIndex = 2;
      const expectedOutput = "0x6300"
      const output = await String.connect(owner).charAt(inputString, inputIndex);

      expect(output).to.equal(expectedOutput);
    });

    it("Should return 0x0000 for '' with index 0", async function () {
      const { String, owner } = await loadFixture(deployStrings);
      const inputString = "";
      const inputIndex = 0;
      const expectedOutput = "0x0000"
      const output = await String.connect(owner).charAt(inputString, inputIndex);

      expect(output).to.equal(expectedOutput);
    });

    it("Should return 0x0000 for 'george' with index 10", async function () {
      const { String, owner } = await loadFixture(deployStrings);
      const inputString = "abcdef";
      const inputIndex = 2;
      const expectedOutput = "0x6300"
      const output = await String.connect(owner).charAt(inputString, inputIndex);

      expect(output).to.equal(expectedOutput);
    });

  });

});
