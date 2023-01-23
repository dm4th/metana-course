const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Address Contract Hack & Protection", function() {
  /** 
   * Create a load fixture to create the contract to be hacked & eventually protected
   */
  async function deployHackThisFixture() {
    const [addr1] = await ethers.getSigners();
    const HackThisfactory = await ethers.getContractFactory("HackThis");
    const HackThis = await HackThisfactory.deploy();
    return { HackThis, addr1 }
  }

  /**
   * Test HackThis functionality and that it'll be hacked by EOA accounts
   */
  describe("HackThis Deployment and Base Functionality", function() {
    it("Should allow an EOA account to call attemptHack on the HackThis contract and return true", async function() {
      const { HackThis, addr1 } = await loadFixture(deployHackThisFixture);
      const hackResult = await HackThis.connect(addr1).attemptHack();
      expect(hackResult).to.be.true;
    });

    it("Should allow an EOA account to call protectedAttemptHack on the HackThis contract and return true", async function() {
      const { HackThis, addr1 } = await loadFixture(deployHackThisFixture);
      const hackResult = await HackThis.connect(addr1).protectedAttemptHack();
      expect(hackResult).to.be.true;
    });

    it("Should revert if another contract tries to call attemptHack", async function() {
      const { HackThis } = await loadFixture(deployHackThisFixture);
      const HackThisAddress = HackThis.address;

      const AddressCallerFactory = await ethers.getContractFactory("AddressCaller");
      const AddressCaller = await AddressCallerFactory.deploy(HackThisAddress);

      await expect(AddressCaller.tryHackThis()).to.be.revertedWith(
        "Must be an EOA to hack me :)"
      );
    });

    it("Should revert if another contract tries to call attemptHack", async function() {
      const { HackThis } = await loadFixture(deployHackThisFixture);
      const HackThisAddress = HackThis.address;

      const AddressCallerFactory = await ethers.getContractFactory("AddressCaller");
      const AddressCaller = await AddressCallerFactory.deploy(HackThisAddress);

      await expect(AddressCaller.tryProtectedHackThis()).to.be.revertedWith(
        "Must be an EOA to hack me :)"
      );
    });

  });

  /**
   * Test HackThis functionality and that it'll be hacked by contracts through the constructor
   */
  describe("Demonstrate ability to hack from constructor of another contract", function() {
    it("Should create the attacker contract successfully and set it's hacked variable to true", async function() {
      const { HackThis } = await loadFixture(deployHackThisFixture);
      const HackThisAddress = HackThis.address;
      
      const succeed = true // boolean to flag whether the hack should succeed or not
      const AddressAttackerFactory = await ethers.getContractFactory("AddressAttacker");
      const AddressAttacker = await AddressAttackerFactory.deploy(HackThisAddress, succeed);

      expect(await AddressAttacker.hacked()).to.be.true;
    });

  });

    /**
     * Test HackThis protection by asserting that msg.sender==tx.origin
     */
    describe("Demonstrate ability to protect from this hack with msg.sender==tx.origin", function() {
      it("Should revert on contract construction", async function() {
        const { HackThis } = await loadFixture(deployHackThisFixture);
        const HackThisAddress = HackThis.address;
        
        const succeed = false // boolean to flag whether the hack should succeed or not
        const AddressAttackerFactory = await ethers.getContractFactory("AddressAttacker");

        await expect(AddressAttackerFactory.deploy(HackThisAddress, succeed)).to.be.revertedWith(
          "Must hack this function directly :)"
        );
      });

  });

});