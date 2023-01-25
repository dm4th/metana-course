// Normal Test File Imports
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { ethers } = require("hardhat");

// Merkle Tree Imports
// const { MerkleTree } = require("merkletreejs");
// const { keccak256 } = require("keccak256");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

describe("Merkle-Airdrop", function () {
  async function deployMerkleContract() {
    // create addresses and assign each of them to receive 1 NFT
    const [owner, addr0, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    let users = [
      { address: owner.address, amount: 1 },
      { address: addr0.address, amount: 1 },
      { address: addr1.address, amount: 3 },
      { address: addr2.address, amount: 1 },
      { address: addr3.address, amount: 2 },
      { address: addr4.address, amount: 2 },
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
    // const leaves = indexStruct.map((s) =>
    //   keccak256(s.address, s.index)
    // );
    const tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
    const root = tree.root;
    
    const AWinnieNFTFactory = await ethers.getContractFactory("AWinnieNFT");
    const AWinnie = await AWinnieNFTFactory.deploy(root);
    await AWinnie.deployed();
    return { AWinnie, owner, addr0, addr1, addr2, addr3, addr4, leaves, tree };
  }

  async function deployContractWithProof() {
    // load previous deployment
    const { AWinnie, owner, addr1, leaves, tree } = await loadFixture(deployMerkleContract);

    // retrieve ownerProofs & addr1 proofs by iterating over entries in the tree
    let ownerProofs = [];
    let addr1Proofs = []
    for (const [i, v] of tree.entries()) {
      if (v[0] === owner.address) {
        ownerProofs.push(tree.getProof(i));
      }
      if (v[0] === addr1.address) {
        addr1Proofs.push(tree.getProof(i));
      }
    }

    return { AWinnie, owner, addr1, leaves, tree, ownerProofs, addr1Proofs }

  }

  describe("NFT Contract Deployment", function () {

    it("Should deploy the NFT contract with the correct Merkle Root", async function () {
      const { AWinnie, tree } = await loadFixture(deployMerkleContract);
      expect(await AWinnie.merkleRoot()).to.equal(tree.root);
    });

  });

  describe("NFT Minting - Expensive Index => Address Mapping vs. Cheap BitMap", function () {

    it("Should allow a pre-determined user to mint an NFT expensively", async function () {
      // load the tree info with pre-computed proofs
      const { AWinnie, owner, leaves, ownerProofs } = await loadFixture(deployContractWithProof);

      // load the data for the first leaf (owner leaf) index value
      const leaf0 = leaves[0];
      const leafAddr = leaf0[0];
      expect(owner.address).to.equal(leafAddr);
      const leafIndex = leaf0[1];

      // mint to the owner address (1 proof)
      const proof = ownerProofs[0];
      await expect(AWinnie.connect(owner).expensiveMint(leafIndex, proof))
        .to.emit(AWinnie, "Claimed")
        .withArgs(leafAddr, leafIndex);

      // check that the NFT is now owned by the owner address
      expect(await AWinnie.ownerOf(leafIndex)).to.equal(owner.address);
    });

  });

});
