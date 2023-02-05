// Normal Test File Imports
const { loadFixture, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Merkle Tree Import
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

// helper function to generate a random number
function getRandomInt(max_value) {
  return Math.floor(Math.random() * max_value);
}

// helper function for getting hashing a random ID with the salt for Commit/reveal
function hashRandomId(id, salt) {
  return ethers.utils.solidityKeccak256(['uint256', 'uint256'], [id, salt]);
}

describe("Merkle-Airdrop", function () {
  async function deployMerkleContract() {
    // create addresses and assign each of them to receive 1 NFT
    const [owner, addr0, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    let users = [
      { address: owner.address, amount: 1 },
      { address: addr0.address, amount: 1 },
      { address: addr1.address, amount: 2 },
    ];
    // loop over amounts for each user and create an array of user --> bitmap index for keeping track of minting
    let index = 0;
    let leaves = []
    for (var u = 0; u < users.length; u++) {
      for (var a = 0; a < users[u].amount; a++) {
        leaves.push( 
          [users[u].address, index]
        );
        index++;
      }
    }
    // Encode data, create the Merkle Tree, and get the root of the tree
    const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
    const root = tree.root;
    // get amount of NFTs that were marked for airdrop phase
    const airdropSupply = index;
    
    const AWinnieNFTFactory = await ethers.getContractFactory("AWinnieNFT");
    const AWinnie = await AWinnieNFTFactory.deploy(root, airdropSupply);
    await AWinnie.deployed();
    return { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree };
  }

  async function commitRandomIds() {
    // load contract from just after deployment
    const { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree } = await loadFixture(deployMerkleContract);
    // get max supply of NFTs
    const MAX_SUPPLY = await AWinnie.MAX_SUPPLY();

    // loop for MAX_SUPPLY times to commit values for randomization later
    // set up helper variables
    const salt = getRandomInt(2**8); // set random salt for generating the hash values
    let idOrderedArr = [];  // store the id values we've already generated
    for (var n = 0; n < MAX_SUPPLY; n++) {
      let randomHash = ethers.utils.keccak256(getRandomInt(MAX_SUPPLY)*salt);
      idOrderedArr.push(randomHash);
      await AWinnie.connect(owner).commitRandomId(n, randomHash);
    }

    return { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree, idOrderedArr }
  }

  async function revealRandomIds() {
    // load contract from just after all of the random ID hashes have been commmitted
    const { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree, idOrderedArr } = await loadFixture(commitRandomIds);
    // get max supply of NFTs
    const MAX_SUPPLY = await AWinnie.MAX_SUPPLY();
    // wait 10 blocks to allow for reveal
    await mine(10);

    // loop for MAX_SUPPLY times to reveal values
    for (var n = 0; n < MAX_SUPPLY; n++) {
      await AWinnie.connect(owner).revealRandomId(n, idOrderedArr[n]);
    }

    return { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree }
  }

  describe("NFT Contract Deployment", function () {

    it("Should revert if the Airdrop Supply is > MAX SUPPLY in the NFT contract", async function () {// create addresses and assign each of them to receive 1 NFT
      const [owner] = await ethers.getSigners();
      let users = [
        { address: owner.address, amount: 11 }, // MAX SUPPLY --> 10 in the contract
      ];
      // loop over amounts for each user and create an array of user --> bitmap index for keeping track of minting
      let index = 0;
      let leaves = []
      for (var u = 0; u < users.length; u++) {
        for (var a = 0; a < users[u].amount; a++) {
          leaves.push( 
            [users[u].address, index]
          );
          index++;
        }
      }
      // Encode data, create the Merkle Tree, and get the root of the tree
      const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
      const root = tree.root;
      // get amount of NFTs that were marked for airdrop phase
      const airdropSupply = index;
      
      const AWinnieNFTFactory = await ethers.getContractFactory("AWinnieNFT");
      await expect(AWinnieNFTFactory.deploy(root, airdropSupply))
        .to.be.revertedWith("Constructor Error: Cannot allocate more than MAX SUPPLY for the airdrop");
    });

    it("Should deploy the NFT contract with the correct Merkle Root", async function () {
      const { AWinnie, tree } = await loadFixture(deployMerkleContract);
      expect(await AWinnie.merkleRoot()).to.equal(tree.root);
    });

    it("Should deploy the NFT contract with the correct Airdrop, PreSale, and PublicSale Supplies", async function () {
      const { AWinnie, owner, leaves } = await loadFixture(deployMerkleContract);
      const airdropSupply = leaves.length;
      const MAX_SUPPLY = await AWinnie.MAX_SUPPLY();
      const preSaleSupply = Math.floor((MAX_SUPPLY-airdropSupply)/4);
      const publicSaleSupply = MAX_SUPPLY-airdropSupply-preSaleSupply;
      expect(await AWinnie.connect(owner).getAirdropSupply()).to.equal(airdropSupply);
      expect(await AWinnie.connect(owner).getPreSaleSupply()).to.equal(preSaleSupply);
      expect(await AWinnie.connect(owner).getPublicSaleSupply()).to.equal(publicSaleSupply);
    });

  });

  describe("Commit Reveal for Random NFT IDs", function () {

    describe("Commit Random Hashes", function () {

      it("Should allow for a random hash to be committed for later randomization for a given index", async function () {
        // load contract from just after deployment
        const { AWinnie, owner } = await loadFixture(deployMerkleContract);

        // create a random number and hash it
        let randomHash = hashRandomId(getRandomInt(100), getRandomInt(100));
        // commit the random hash to the 0th index
        await AWinnie.connect(owner).commitRandomId(0, randomHash);

        // verify that the values are stored correctly
        expect(await AWinnie.connect(owner).gethashedIdMapHash(0)).to.equal(randomHash);
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(0)).to.be.false;
      });

      it("Should revert if we try to commit an index a second time", async function () {
        // load contract from just after deployment
        const { AWinnie, owner } = await loadFixture(deployMerkleContract);

        // create a random number and hash it
        let randomHash = hashRandomId(getRandomInt(100), getRandomInt(100));
        // commit the random hash to the 0th index
        await AWinnie.connect(owner).commitRandomId(0, randomHash);
        // try the same commit again
        await expect(AWinnie.connect(owner).commitRandomId(0, randomHash))
        .to.be.revertedWith("Commit Random ID Error: Index Already Committed");
      });

      it("Should revert if an address other than the owner tries to commit", async function () {
        // load contract from just after deployment
        const { AWinnie, addr1 } = await loadFixture(deployMerkleContract);

        // create a random number and hash it
        let randomHash = hashRandomId(getRandomInt(100), getRandomInt(100));
        // call from another address than the owner
        await expect(AWinnie.connect(addr1).commitRandomId(0, randomHash))
        .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if we try to commit from a different stage of the contract's lifecycle", async function () {
        // load contract from after all of the commits are reveald (wrong timing)
        const { AWinnie, owner } = await loadFixture(revealRandomIds);

        // create a random number and hash it
        let randomHash = hashRandomId(getRandomInt(100), getRandomInt(100));
        await expect(AWinnie.connect(owner).commitRandomId(0, randomHash))
          .to.be.revertedWith("State Machine Error: Incorrect Stage of Contract Lifecycle");
      });

    });

    describe("Reveal Random Hashes", function () {

      it("Should allow for the owner to reveal a random ID for a given index with the correct hash", async function () {
        // load contract from just after all of the 
        const { AWinnie, owner, idOrderedArr } = await loadFixture(commitRandomIds);

        // check that the value for reveal is false before reveal
        const revealIndex = getRandomInt(await AWinnie.MAX_SUPPLY());   // Use random index between 0 & MAX_SUPPLY
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.false;

        // wait 10 blocks to allow for reveal
        await mine(10);

        // reveal the random ID at a given index - don't pull value from the blockchain though
        await AWinnie.connect(owner).revealRandomId(revealIndex, idOrderedArr[revealIndex]);

        // check that the reveal boolean updated to true
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.true;
      });

      it("Should revert if we try to reveal a given index a second time", async function () {
        // load contract from just after all of the 
        const { AWinnie, owner, idOrderedArr } = await loadFixture(commitRandomIds);

        // check that the value for reveal is false before reveal
        const revealIndex = getRandomInt(await AWinnie.MAX_SUPPLY());   // Use random index between 0 & MAX_SUPPLY
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.false;

        // wait 10 blocks to allow for reveal
        await mine(10);

        // reveal the random ID at a given index - don't pull value from the blockchain though
        await AWinnie.connect(owner).revealRandomId(revealIndex, idOrderedArr[revealIndex]);
        // revert on trying to reveal a second time
        await expect(AWinnie.connect(owner).revealRandomId(revealIndex, idOrderedArr[revealIndex]))
          .to.be.revertedWith("Reveal Random ID: Index value already revealed");
      });

      it("Should revert if we try to reveal before 10 blocks have passed from the final random hash commit", async function () {
        // load contract from just after all of the 
        const { AWinnie, owner, idOrderedArr } = await loadFixture(commitRandomIds);

        // check that the value for reveal is false before reveal
        const revealIndex = getRandomInt(await AWinnie.MAX_SUPPLY());   // Use random index between 0 & MAX_SUPPLY
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.false;

        // comment out the wait 10 blocks to allow for reveal to force revert
        // await mine(10);

        // reveal the random ID at a given index - don't pull value from the blockchain though
        await expect(AWinnie.connect(owner).revealRandomId(revealIndex, idOrderedArr[revealIndex]))
          .to.be.revertedWith("Reveal Random ID: Need to wait longer before reveal can happen");
      });

      it("Should revert if we try to use an incorrect random ID to reveal an index", async function () {
        // load contract from just after all of the 
        const { AWinnie, owner, idOrderedArr } = await loadFixture(commitRandomIds);

        // check that the value for reveal is false before reveal
        const revealIndex = getRandomInt((await AWinnie.MAX_SUPPLY())-1);   // Use random index between 0 & MAX_SUPPLY - 1
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.false;

        // wait 10 blocks to allow for reveal
        await mine(10);

        // try to reveal the next index's ID value as a proxy for giving the wrong ID 
        await expect(AWinnie.connect(owner).revealRandomId(revealIndex, idOrderedArr[revealIndex+1]))
          .to.be.revertedWith("Reveal Random ID: Incorrect random hash input for this index");
      });

      it("Should revert if an address other than the owner tries to reveal", async function () {
        // load contract from just after all of the 
        const { AWinnie, owner, addr1, idOrderedArr } = await loadFixture(commitRandomIds);

        // check that the value for reveal is false before reveal
        const revealIndex = getRandomInt(await AWinnie.MAX_SUPPLY());   // Use random index between 0 & MAX_SUPPLY
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(revealIndex)).to.be.false;

        // wait 10 blocks to allow for reveal
        await mine(10);

        // call from another address than the owner
        await expect(AWinnie.connect(addr1).revealRandomId(revealIndex, idOrderedArr[revealIndex]))
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should revert if we try to reveal from an earlier stage of the contract's lifecycle", async function () {
        // load contract from just after deployment
        const { AWinnie, owner } = await loadFixture(deployMerkleContract);

        // hash & commit a random ID without revert
        const MAX_SUPPLY = await AWinnie.connect(owner).MAX_SUPPLY();
        const salt = getRandomInt(2**8);
        const randomId = getRandomInt(MAX_SUPPLY);
        const randomHash = hashRandomId(randomId, salt);
        await AWinnie.connect(owner).commitRandomId(0, randomHash);

        // verify that the values are stored correctly
        expect(await AWinnie.connect(owner).gethashedIdMapHash(0)).to.equal(randomHash);
        expect(await AWinnie.connect(owner).gethashedIdMapReveal(0)).to.be.false;

        // immediately try to reveal the committed value
        await expect(AWinnie.connect(owner).revealRandomId(0, randomHash))
          .to.be.revertedWith("State Machine Error: Incorrect Stage of Contract Lifecycle");
      });

    });

  });

  describe("NFT Minting - Testing Expensive and Cheap Mint Functionality", function () {

    /**
     * Expensive Mint Tests
     */
    describe("NFT Minting - Expensive Mint", function () {

      it("Should allow a pre-determined user to mint an NFT expensively", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) 
        const leaf0 = leaves[0];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1];
  
        // retrive the merkle proof for the owner (will be the first proof)
        const proof = tree.getProof(0);
  
        // mint to the owner address (1 proof) and emit a Claimed Event
        await expect(AWinnie.connect(owner).expensiveAirdropMint(leafIndex, proof))
          .to.emit(AWinnie, "Claimed")
          .withArgs(leafAddr, leafIndex);
  
        // check that the NFT is now owned by the owner address
        // expect(await AWinnie.ownerOf(leafIndex)).to.equal(owner.address);
      });
  
      it("Should revert if an address tries to expensive mint an index they aren't allocated to", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) and the first leaf (to set up mrekle revert)
        const leaf0 = leaves[0];
        const leaf1 = leaves[1];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf1[1]; // incorrect index
        const proof = tree.getProof(0); // correct proof
  
        // mint to the owner address (1 proof) but to the wrong index to force revert
        await expect(AWinnie.connect(owner).expensiveAirdropMint(leafIndex, proof))
          .to.be.revertedWith("Merkle Tree: Invalid Proof");
      });
  
      it("Should revert an address tries to expensive mint an index their allocated but with an incorrect proof", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) and the first leaf (to set up mrekle revert)
        const leaf0 = leaves[0];
        const leaf1 = leaves[1];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1]; // correct index
        const proof = tree.getProof(1); // incorrect proof
  
        // mint to the owner address (1 proof) but to the wrong index to force revert
        await expect(AWinnie.connect(owner).expensiveAirdropMint(leafIndex, proof))
          .to.be.revertedWith("Merkle Tree: Invalid Proof");
      });
  
      it("Should revert if an address tries to expensive mint a preallocated index a second time", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) 
        const leaf0 = leaves[0];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1];
  
        // retrive the merkle proof for the owner (will be the first proof)
        const proof = tree.getProof(0);
  
        // mint to the owner address (1 proof) and emit a Claimed Event
        await expect(AWinnie.connect(owner).expensiveAirdropMint(leafIndex, proof))
          .to.emit(AWinnie, "Claimed")
          .withArgs(leafAddr, leafIndex);
  
        // check that the NFT is now owned by the owner address
        // expect(await AWinnie.ownerOf(leafIndex)).to.equal(owner.address);
  
        // try to mint a second time witha  valid proof to cause revert
        await expect(AWinnie.connect(owner).expensiveAirdropMint(leafIndex, proof))
        .to.be.revertedWith("Expensive Mint Error: Already Minted");
      });

    });

    /**
     * Cheap Mint Tests
     */

    describe("NFT Minting - Cheap Mint", function () {

      it("Should allow a pre-determined user to mint an NFT cheaply", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) 
        const leaf0 = leaves[0];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1];
  
        // retrive the merkle proof for the owner (will be the first proof)
        const proof = tree.getProof(0);
  
        // mint to the owner address (1 proof) and emit a Claimed Event
        await expect(AWinnie.connect(owner).cheapAirdropMint(leafIndex, proof))
          .to.emit(AWinnie, "Claimed")
          .withArgs(leafAddr, leafIndex);
  
        // check that the NFT is now owned by the owner address
        // expect(await AWinnie.ownerOf(leafIndex)).to.equal(owner.address);
      });
  
      it("Should revert if an address tries to cheap mint an index they aren't allocated to", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) and the first leaf (to set up mrekle revert)
        const leaf0 = leaves[0];
        const leaf1 = leaves[1];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf1[1]; // incorrect index
        const proof = tree.getProof(0); // correct proof
  
        // mint to the owner address (1 proof) but to the wrong index to force revert
        await expect(AWinnie.connect(owner).cheapAirdropMint(leafIndex, proof))
          .to.be.revertedWith("Merkle Tree: Invalid Proof");
      });
  
      it("Should revert an address tries to cheap mint an index their allocated but with an incorrect proof", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) and the first leaf (to set up mrekle revert)
        const leaf0 = leaves[0];
        const leaf1 = leaves[1];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1]; // correct index
        const proof = tree.getProof(1); // incorrect proof
  
        // mint to the owner address (1 proof) but to the wrong index to force revert
        await expect(AWinnie.connect(owner).cheapAirdropMint(leafIndex, proof))
          .to.be.revertedWith("Merkle Tree: Invalid Proof");
      });
  
      it("Should revert if an address tries to cheap mint a preallocated index a second time", async function () {
        // load the tree info with revealed random IDs
        const { AWinnie, owner, leaves, tree } = await loadFixture(revealRandomIds);
  
        // load the data for the first leaf (owner leaf) 
        const leaf0 = leaves[0];
        const leafAddr = leaf0[0];
        expect(owner.address).to.equal(leafAddr);
        const leafIndex = leaf0[1];
  
        // retrive the merkle proof for the owner (will be the first proof)
        const proof = tree.getProof(0);
  
        // mint to the owner address (1 proof) and emit a Claimed Event
        await expect(AWinnie.connect(owner).cheapAirdropMint(leafIndex, proof))
          .to.emit(AWinnie, "Claimed")
          .withArgs(leafAddr, leafIndex);
  
        // check that the NFT is now owned by the owner address
        // expect(await AWinnie.ownerOf(leafIndex)).to.equal(owner.address);
  
        // try to mint a second time witha  valid proof to cause revert
        await expect(AWinnie.connect(owner).cheapAirdropMint(leafIndex, proof))
        .to.be.revertedWith("Cheap Mint Error: Already Minted");
      });

    });

    describe("NFT Minting - Expensive Index => Address Mapping vs. Cheap BitMap Gas Savings", function () {

      it("See Report at the bottom or ETH based gas calcs converted to USD for each of the functions in the contract", async function () {
        return true;
      });
  
    });

  });

  

});
