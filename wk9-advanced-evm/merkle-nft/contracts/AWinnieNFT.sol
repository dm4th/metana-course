// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
// import "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract AWinnieNFT is ERC721, Ownable {
    // Define libraries to use for data types
    using SafeMath for uint256;

    // declare globals
    bytes32 public immutable merkleRoot;

    // Globals for tracking how expensive a mapping of address --> bool is compared to a bitmap
    // Set the bitmap = the MAX INT to initalize at contract creation
    mapping(uint256 => bool) private expensiveMinted;
    uint256 private mintedBitmap = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

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
        require(expensiveMinted[index] == false, "Expensive Mint Error: Already Minted");
        expensiveMinted[index] = true;
        _safeMint(msg.sender, index);
        emit Claimed(msg.sender, index);
    }

    // mint the token to the calling address if they can provide the correct merkle proof
    // update the bitmap object (cheaper)
    function cheapMint(
        uint256 index,
        bytes32[] calldata merkleProof
    ) public merkleVerified(
        msg.sender,
        index,
        merkleProof
    ) {
        require(bitmapCheck(index) == false, "Cheap Mint Error: Already Minted");
        bitmapSet(index);
        _safeMint(msg.sender, index);
        emit Claimed(msg.sender, index);
    }


    /**
     * HELPER FUNCTIONS
     */

    // make the NFT work with NFT front-ends like OpenSea
    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }

    // function to check the bitmap value at a given index (0 --> true value)
    function bitmapCheck(uint256 index) internal view returns(bool) {
        return mintedBitmap & (1 << (index & 0xff)) == 0;
    }

    // function to set a bitmap index value to 0 (representing a true value)
    function bitmapSet(uint256 index) internal {
        mintedBitmap &= ~(1 << (index & 0xff));
    }

    // function to set a bitmap index value to 1 (representing a false value)
    function bitmaUnSet(uint256 index) internal {
        mintedBitmap |= 1 << (index & 0xff);
    }

    // function to set a bitmap index value to the value in value
    function bitmaSetValue(uint256 index, bool value) internal {
        if (value) {
            bitmapSet(index);
        } else {
            bitmaUnSet(index);
        }
    }
}
