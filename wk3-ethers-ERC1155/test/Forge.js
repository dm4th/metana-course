const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Forgery Contract Interaction", function () {
  // Base load fixture to deploy the token and logic contracts together without minting starter tokens
  async function deployBaseForge() {
    // initialize addresses
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // deploy token contract
    const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
    const ForgeToken = await ForgeTokenFactory.deploy();
    const ForgeTokenAddress = ForgeToken.address;

    // deploy logic contract with address of token contract
    const ForgeLogicFactory = await ethers.getContractFactory("ForgeLogic");
    const ForgeLogic = await ForgeLogicFactory.deploy(ForgeTokenAddress);
    const ForgeLogicAddress = ForgeLogic.address;

    // change minter address on token contract
    await ForgeToken.changeMinter(ForgeLogicAddress);

    // Return contracts and 3 addresses to interact including owner
    return { ForgeToken, ForgeLogic, owner, addr1, addr2, addr3, addr4 };
  }

  // Extra load fixture to deploy the token and logic contracts together give all starter tokens to addresses
  async function deployExtraForge() {
    const { ForgeToken, ForgeLogic, owner, addr1, addr2, addr3, addr4 } =
      await loadFixture(deployBaseForge);

    const zero = await ForgeToken.ZERO();
    const one = await ForgeToken.ONE();
    const two = await ForgeToken.TWO();

    await ForgeLogic.connect(addr1).mintStarter(zero);
    await ForgeLogic.connect(addr2).mintStarter(zero);
    await ForgeLogic.connect(addr3).mintStarter(zero);
    await ForgeLogic.connect(addr4).mintStarter(zero);

    await ForgeLogic.connect(addr1).mintStarter(one);
    await ForgeLogic.connect(addr2).mintStarter(one);
    await ForgeLogic.connect(addr3).mintStarter(one);
    await ForgeLogic.connect(addr4).mintStarter(one);

    await ForgeLogic.connect(addr1).mintStarter(two);
    await ForgeLogic.connect(addr2).mintStarter(two);
    await ForgeLogic.connect(addr3).mintStarter(two);
    await ForgeLogic.connect(addr4).mintStarter(two);

    return { ForgeToken, ForgeLogic, owner, addr1, addr2, addr3, addr4 };
  }

  // Extra load fixture to deploy the token and logic contracts together give higher tokens to addresses
  async function deployHigherForge() {
    const { ForgeToken, ForgeLogic, owner, addr1, addr2, addr3, addr4 } =
      await loadFixture(deployExtraForge);

    await ForgeLogic.connect(addr1).mint3();
    await ForgeLogic.connect(addr2).mint4();
    await ForgeLogic.connect(addr3).mint5();
    await ForgeLogic.connect(addr4).mint6();

    return { ForgeToken, ForgeLogic, owner, addr1, addr2, addr3, addr4 };
  }

  // Test Delployment of Contracts
  describe("Deployment and Basic Logic", function () {
    it("Should revert if the ForgeLogic contract is created with an EOA account", async function () {
      // initialize addresses
      const [addr] = await ethers.getSigners();

      // deploy logic contract with address of addr1 and expect revert
      const ForgeLogicFactory = await ethers.getContractFactory("ForgeLogic");
      await expect(ForgeLogicFactory.deploy(addr.address)).to.be.revertedWith(
        "Token Contract argument must be a deployed contract!!"
      );
    });

    it("Should revert if the ForgeLogic contract is created with a different EOA account than the associated ForgeToken Contract", async function () {
      // initialize addresses
      const [owner, addr1] = await ethers.getSigners();

      // deploy token contract with owner as signer
      const ForgeTokenFactory = await ethers.getContractFactory(
        "ForgeToken",
        owner
      );
      const ForgeToken = await ForgeTokenFactory.deploy();
      const ForgeTokenAddress = ForgeToken.address;

      // deploy logic contract with address of addr1 and expect revert
      const ForgeLogicFactory = await ethers.getContractFactory(
        "ForgeLogic",
        addr1
      );
      await expect(
        ForgeLogicFactory.deploy(ForgeTokenAddress)
      ).to.be.revertedWith(
        "The owner of the ERC1155 token contract must be the same as this contract!!"
      );
    });

    it("Should revert if changeMinter is called on the ForgeToken contract by an address that isn't the owner", async function () {
      // initialize addresses
      const [owner, addr1] = await ethers.getSigners();

      // deploy token contract with owner as signer
      const ForgeTokenFactory = await ethers.getContractFactory(
        "ForgeToken",
        owner
      );
      const ForgeToken = await ForgeTokenFactory.deploy();
      const ForgeTokenAddress = ForgeToken.address;

      // deploy logic contract with address of token contract
      const ForgeLogicFactory = await ethers.getContractFactory("ForgeLogic");
      const ForgeLogic = await ForgeLogicFactory.deploy(ForgeTokenAddress);
      const ForgeLogicAddress = ForgeLogic.address;

      // change minter address from addr1 and cause revert
      await expect(ForgeToken.connect(addr1).changeMinter(ForgeLogicAddress)).to
        .be.reverted;
    });

    it("Should revert if the owner tries to change the minter address to an EOA address", async function () {
      // initialize addresses
      const [owner, addr1] = await ethers.getSigners();

      // deploy token contract with owner as signer
      const ForgeTokenFactory = await ethers.getContractFactory(
        "ForgeToken",
        owner
      );
      const ForgeToken = await ForgeTokenFactory.deploy();

      // change minter address to addr1 and cause revert
      await expect(
        ForgeToken.connect(owner).changeMinter(addr1.address)
      ).to.be.revertedWith("New Minter Address must be another contract!!");
    });

    it("Should deploy Forge Token, Forge Logic, and set Correct Minter", async function () {
      const { ForgeToken, ForgeLogic } = await loadFixture(deployBaseForge);
      expect(await ForgeToken._minter()).to.equal(await ForgeLogic.address);
    });

    it("Should revert if the caller of mint is not another contract", async function () {
      const { ForgeToken, addr1 } = await loadFixture(deployBaseForge);
      const testID = await ForgeToken.ZERO();
      const tokenAmount = 1;

      // have addr1 call the mint function and revert
      await expect(
        ForgeToken.connect(addr1).mint(addr1.address, testID, tokenAmount)
      ).to.be.revertedWith("Can only mint through another contract!!");
    });

    it("Should revert if the caller of burn is not another contract", async function () {
      const { ForgeToken, addr1 } = await loadFixture(deployBaseForge);
      const testID = await ForgeToken.ZERO();
      const tokenAmount = 1;

      // have addr1 call the burn function and revert
      await expect(
        ForgeToken.connect(addr1).burn(addr1.address, testID, tokenAmount)
      ).to.be.revertedWith("Can only burn through another contract!!");
    });

    it("Should revert if the caller of mint is not set as the minter contract", async function () {
      // cannot use the base fixture for this test
      // initialize addresses
      const [owner] = await ethers.getSigners();

      // deploy token contract
      const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
      const ForgeToken = await ForgeTokenFactory.deploy();
      const ForgeTokenAddress = ForgeToken.address;

      // deploy logic contract with address of token contract
      const ForgeLogicFactory = await ethers.getContractFactory("ForgeLogic");
      const ForgeLogic = await ForgeLogicFactory.deploy(ForgeTokenAddress);

      // forget to change minter address on token contract to simulate the error
      // await ForgeToken.changeMinter(ForgeLogicAddress);

      // try to call mintStarter from ForgeLogic before being set as minter
      const testID = await ForgeToken.ZERO();
      await expect(
        ForgeLogic.connect(owner).mintStarter(testID)
      ).to.be.revertedWith("Calling contract not set as the minter!!");
    });

    it("Should revert if the caller of burn is not set as the minter contract", async function () {
      // cannot use the base fixture for this test
      // initialize addresses
      const [owner] = await ethers.getSigners();

      // deploy token contract
      const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
      const ForgeToken = await ForgeTokenFactory.deploy();
      const ForgeTokenAddress = ForgeToken.address;

      // deploy logic contract with address of token contract
      const ForgeLogicFactory = await ethers.getContractFactory("ForgeLogic");
      const ForgeLogic = await ForgeLogicFactory.deploy(ForgeTokenAddress);

      // forget to change minter address on token contract to simulate the error
      // await ForgeToken.changeMinter(ForgeLogicAddress);

      // try to call mintStarter from ForgeLogic before being set as minter
      const testID = await ForgeToken.ZERO();
      await expect(
        ForgeLogic.connect(owner).burnToken(testID)
      ).to.be.revertedWith("Calling contract not set as the burner!!");
    });

    it("Should revert if a mint of any kind on the token contract is not 0-6", async function () {
      // cannot use the base fixture for this test
      // deploy token contract
      const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
      const ForgeToken = await ForgeTokenFactory.deploy();
      const ForgeTokenAddress = ForgeToken.address;

      // deploy attack logic contract with address of token contract
      const ForgeLogicAttackFactory = await ethers.getContractFactory(
        "ForgeLogicAttack"
      );
      const ForgeLogicAttack = await ForgeLogicAttackFactory.deploy(
        ForgeTokenAddress
      );
      const ForgeLogicAttackAddress = ForgeLogicAttack.address;

      // change minter address on token contract to the attack address
      await ForgeToken.changeMinter(ForgeLogicAttackAddress);

      // try to call mintAttack from the Attack contract with ID 7 which is outside the range of possible IDs
      const testID = 7;
      await expect(ForgeLogicAttack.mintAttack(testID)).to.be.revertedWith(
        "Mint Token ID not in range"
      );
    });
  });

  describe("Minting Starters", function () {
    it("Should Allow for mint of Token 0", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployBaseForge
      );
      const testID = await ForgeToken.ZERO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get balance before minting
      const balance = await ForgeToken.balanceOf(addr1.address, testID);

      // call mint starter function and assert that the balance is now updated
      await ForgeLogic.connect(addr1).mintStarter(testID);
      expect(await ForgeToken.balanceOf(addr1.address, testID)).to.equal(
        balance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should Allow for mint of Token 1", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployBaseForge
      );
      const testID = await ForgeToken.ONE();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get balance before minting
      const balance = await ForgeToken.balanceOf(addr1.address, testID);

      // call mint starter function and assert that the balance is now updated
      await ForgeLogic.connect(addr1).mintStarter(testID);
      expect(await ForgeToken.balanceOf(addr1.address, testID)).to.equal(
        balance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should Allow for mint of Token 2", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployBaseForge
      );
      const testID = await ForgeToken.TWO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get balance before minting
      const balance = await ForgeToken.balanceOf(addr1.address, testID);

      // call mint starter function and assert that the balance is now updated
      await ForgeLogic.connect(addr1).mintStarter(testID);
      expect(await ForgeToken.balanceOf(addr1.address, testID)).to.equal(
        balance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should Revert if a Starter mint doesn't wait for the cooldown time", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployBaseForge
      );
      const testID = await ForgeToken.TWO();

      // call mint starter function twice in succession to cause revert
      await ForgeLogic.connect(addr1).mintStarter(testID);
      await expect(
        ForgeLogic.connect(addr1).mintStarter(testID)
      ).to.be.revertedWith("Need to wait for token cooldown!!");
    });

    it("Should Revert if the minting ID is 3 (as a proxy for IDs 3, 4, 5, 6)", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployBaseForge
      );
      const testID = await ForgeToken.THREE();

      // call mint starter function to cause revert
      await expect(
        ForgeLogic.connect(addr1).mintStarter(testID)
      ).to.be.revertedWith("Wrong input ID to function mintStarter!!");
    });
  });

  describe("Minting Higher Level Tokens", function () {
    it("Should Allow for mint of Token 3, with burn of tokens 0, 1", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployExtraForge
      );
      const testID = await ForgeToken.THREE();
      const burn1 = await ForgeToken.ZERO();
      const burn2 = await ForgeToken.ONE();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const targetPreBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PreBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PreBalance = await ForgeToken.balanceOf(addr1.address, burn2);

      // call mint3 function and assert that the balances updated
      await ForgeLogic.connect(addr1).mint3();
      const targetPostBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PostBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PostBalance = await ForgeToken.balanceOf(addr1.address, burn2);
      expect(targetPostBalance.toNumber()).to.equal(
        targetPreBalance.toNumber() + tokenAmount.toNumber()
      );
      expect(burn1PostBalance.toNumber()).to.equal(
        burn1PreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(burn2PostBalance.toNumber()).to.equal(
        burn2PreBalance.toNumber() - tokenAmount.toNumber()
      );
    });

    it("Should Allow for mint of Token 4, with burn of tokens 1, 2", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployExtraForge
      );
      const testID = await ForgeToken.FOUR();
      const burn1 = await ForgeToken.ONE();
      const burn2 = await ForgeToken.TWO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const targetPreBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PreBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PreBalance = await ForgeToken.balanceOf(addr1.address, burn2);

      // call mint4 function and assert that the balances updated
      await ForgeLogic.connect(addr1).mint4();
      const targetPostBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PostBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PostBalance = await ForgeToken.balanceOf(addr1.address, burn2);
      expect(targetPostBalance.toNumber()).to.equal(
        targetPreBalance.toNumber() + tokenAmount.toNumber()
      );
      expect(burn1PostBalance.toNumber()).to.equal(
        burn1PreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(burn2PostBalance.toNumber()).to.equal(
        burn2PreBalance.toNumber() - tokenAmount.toNumber()
      );
    });

    it("Should Allow for mint of Token 5, with burn of tokens 0, 2", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployExtraForge
      );
      const testID = await ForgeToken.FIVE();
      const burn1 = await ForgeToken.ZERO();
      const burn2 = await ForgeToken.TWO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const targetPreBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PreBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PreBalance = await ForgeToken.balanceOf(addr1.address, burn2);

      // call mint5 function and assert that the balances updated
      await ForgeLogic.connect(addr1).mint5();
      const targetPostBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PostBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PostBalance = await ForgeToken.balanceOf(addr1.address, burn2);
      expect(targetPostBalance.toNumber()).to.equal(
        targetPreBalance.toNumber() + tokenAmount.toNumber()
      );
      expect(burn1PostBalance.toNumber()).to.equal(
        burn1PreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(burn2PostBalance.toNumber()).to.equal(
        burn2PreBalance.toNumber() - tokenAmount.toNumber()
      );
    });

    it("Should Allow for mint of Token 6, with burn of tokens 0, 1, 2", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployExtraForge
      );
      const testID = await ForgeToken.SIX();
      const burn1 = await ForgeToken.ZERO();
      const burn2 = await ForgeToken.ONE();
      const burn3 = await ForgeToken.TWO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const targetPreBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PreBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PreBalance = await ForgeToken.balanceOf(addr1.address, burn2);
      const burn3PreBalance = await ForgeToken.balanceOf(addr1.address, burn3);

      // call mint6 function and assert that the balances updated
      await ForgeLogic.connect(addr1).mint6();
      const targetPostBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      const burn1PostBalance = await ForgeToken.balanceOf(addr1.address, burn1);
      const burn2PostBalance = await ForgeToken.balanceOf(addr1.address, burn2);
      const burn3PostBalance = await ForgeToken.balanceOf(addr1.address, burn3);
      expect(targetPostBalance.toNumber()).to.equal(
        targetPreBalance.toNumber() + tokenAmount.toNumber()
      );
      expect(burn1PostBalance.toNumber()).to.equal(
        burn1PreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(burn2PostBalance.toNumber()).to.equal(
        burn2PreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(burn3PostBalance.toNumber()).to.equal(
        burn3PreBalance.toNumber() - tokenAmount.toNumber()
      );
    });
  });

  describe("Higher Level Tokens Burns & Trades", function () {
    it("Should Allow for burn of token 3", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployHigherForge
      );
      const testID = await ForgeToken.THREE();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const targetPreBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );

      // call burnToken function and assert that the balances updated
      await ForgeLogic.connect(addr1).burnToken(testID);
      const targetPostBalance = await ForgeToken.balanceOf(
        addr1.address,
        testID
      );
      expect(targetPostBalance.toNumber()).to.equal(
        targetPreBalance.toNumber() - tokenAmount.toNumber()
      );
    });

    it("Should Allow for trade of token 4 for token 0", async function () {
      const { ForgeToken, ForgeLogic, addr2 } = await loadFixture(
        deployHigherForge
      );
      const fromID = await ForgeToken.FOUR();
      const toID = await ForgeToken.ZERO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const fromPreBalance = await ForgeToken.balanceOf(addr2.address, fromID);
      const toPreBalance = await ForgeToken.balanceOf(addr2.address, toID);

      // call transferToken function and assert that the balances updated
      await ForgeLogic.connect(addr2).transferToken(fromID, toID);
      const fromPostBalance = await ForgeToken.balanceOf(addr2.address, fromID);
      const toPostBalance = await ForgeToken.balanceOf(addr2.address, toID);
      expect(fromPostBalance.toNumber()).to.equal(
        fromPreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(toPostBalance.toNumber()).to.equal(
        toPreBalance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should Allow for trade of token 5 for token 1", async function () {
      const { ForgeToken, ForgeLogic, addr3 } = await loadFixture(
        deployHigherForge
      );
      const fromID = await ForgeToken.FIVE();
      const toID = await ForgeToken.ONE();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const fromPreBalance = await ForgeToken.balanceOf(addr3.address, fromID);
      const toPreBalance = await ForgeToken.balanceOf(addr3.address, toID);

      // call transferToken function and assert that the balances updated
      await ForgeLogic.connect(addr3).transferToken(fromID, toID);
      const fromPostBalance = await ForgeToken.balanceOf(addr3.address, fromID);
      const toPostBalance = await ForgeToken.balanceOf(addr3.address, toID);
      expect(fromPostBalance.toNumber()).to.equal(
        fromPreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(toPostBalance.toNumber()).to.equal(
        toPreBalance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should Allow for trade of token 6 for token 2", async function () {
      const { ForgeToken, ForgeLogic, addr4 } = await loadFixture(
        deployHigherForge
      );
      const fromID = await ForgeToken.SIX();
      const toID = await ForgeToken.TWO();
      const tokenAmount = await ForgeLogic.tokenAmount();

      // get the balances of the burn IDs and the target ID
      const fromPreBalance = await ForgeToken.balanceOf(addr4.address, fromID);
      const toPreBalance = await ForgeToken.balanceOf(addr4.address, toID);

      // call transferToken function and assert that the balances updated
      await ForgeLogic.connect(addr4).transferToken(fromID, toID);
      const fromPostBalance = await ForgeToken.balanceOf(addr4.address, fromID);
      const toPostBalance = await ForgeToken.balanceOf(addr4.address, toID);
      expect(fromPostBalance.toNumber()).to.equal(
        fromPreBalance.toNumber() - tokenAmount.toNumber()
      );
      expect(toPostBalance.toNumber()).to.equal(
        toPreBalance.toNumber() + tokenAmount.toNumber()
      );
    });

    it("Should revert on a trade of any token for itself (1 used as proxy", async function () {
      const { ForgeToken, ForgeLogic, addr1 } = await loadFixture(
        deployHigherForge
      );
      const fromID = await ForgeToken.ONE();
      const toID = await ForgeToken.ONE();

      // call tranferToken function and revert
      await expect(
        ForgeLogic.connect(addr1).transferToken(fromID, toID)
      ).to.be.revertedWith("Why are you trading a token for itself??!!");
    });

    it("Should Revert on trade of token 5 for token 3", async function () {
      const { ForgeToken, ForgeLogic, addr3 } = await loadFixture(
        deployHigherForge
      );
      const fromID = await ForgeToken.FIVE();
      const toID = await ForgeToken.THREE();

      // call tranferToken function and revert
      await expect(
        ForgeLogic.connect(addr3).transferToken(fromID, toID)
      ).to.be.revertedWith("Can only trade for starter tokens!!");
    });
  });
});
