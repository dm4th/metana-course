// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract AWinnieNFT is ERC721, Ownable {
    // Define libraries to use for data types
    using SafeMath for uint256;
    using BitMaps for BitMaps.BitMap;

    // declare globals
    bytes32 public immutable merkleRoot;
    uint256 public constant MAX_SUPPLY = 10;

    // Globals for tracking how expensive a mapping of address --> bool is compared to a bitmap
    mapping(address => bool) private expensiveMinted;
    BitMaps.BitMap private minted;

    // event for a claim of an NFT
    event Claimed(address account, uint256 amount);    

    // modifiers
    // modifier for verification of merkle proof for claiming NFTs
    modifier merkleVerified(
      address account,
      uint256 amount,
      bytes32[] calldata merkleProof  
    ) {
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));
        require(
            keccak256(merkleProof, merkleRoot, leaf),
            "Merkle Tree: Invalid Proof"
        );
        _;
    }

    // Store the Merkle Root at contract construction
    constructor(bytes32 _merkleRoot) ERC721("Advanced WinnieNFT", "AWN") {
        merkleRoot = _merkleRoot;
    }


    // make the NFT work with NFT front-ends like OpenSea
    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }

    // function to verify Merkle Proofs for airdrops

    function expensiveMint() public {

    }
}
