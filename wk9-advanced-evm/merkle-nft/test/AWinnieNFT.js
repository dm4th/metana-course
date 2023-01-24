// Normal Test File Imports
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
// const { ethers } = require("hardhat");

// Merkle Tree Imports
const { MerkleTree } = require("merkletreejs");
const { keccak256 } = require("keccak256");

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
    let struct = []
    for (var u = 0; u < users.length; u++) {
      for (var a = 0; a < users[u].amount; a++) {
        struct.push( 
          { address: users[u].address, index: index}
        );
        index++;
      }
    }
    // Encode data, create the Merkle Tree, and get the root of the tree
    const leaves = struct.map((s) =>
      ethers.utils.solidityKeccak256(
        ["address", "uint256"], [s.address, s.index]
      ));
    const tree = new MerkleTree(leaves, keccak256, { sort: true }) ;
    const root = tree.getHexRoot();
    
    const AWinnieNFTFactory = await ethers.getContractFactory("AWinnieNFT");
    const AWinnie = await AWinnieNFTFactory.deploy(root);
    return { struct, root, AWinnie };
  }

  describe("NFT Deployment", function () {

    it("Should deploy", async function () {
      const { struct, root } = await loadFixture(deployMerkleContract);
      console.log(users);
      console.log(root);

    });

  });

});
