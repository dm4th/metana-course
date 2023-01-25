// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
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

    // Globals for tracking how expensive a mapping of address --> bool is compared to a bitmap
    mapping(uint256 => address) private expensiveMinted;
    BitMaps.BitMap private minted;

    // event for a claim of an NFT
    event Claimed(address account, uint256 index);    

    // modifiers
    // modifier for verification of merkle proof for claiming NFTs
    modifier merkleVerified(
      address account,
      uint256 index,
      bytes32[] memory merkleProof  
    ) {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(account, index))));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
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

    // mint the token to the calling address if they can provide the correct merkle proof
    // update the mapping object (more expensive)
    function expensiveMint(
        uint256 index,
        bytes32[] calldata merkleProof
    ) public merkleVerified(
        msg.sender,
        index,
        merkleProof
    ) {
        require(expensiveMinted[index] == address(0), "Expensive Mint Error: Already Minted");
        expensiveMinted[index] = msg.sender;
        _mint(msg.sender, index);
        emit Claimed(msg.sender, index);
    }
}
