// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract AWinnieNFT is ERC721, Ownable {

    /**
     * Globals
     */

    // Define libraries to use for data types
    using SafeMath for uint256;

    // declare globals
    bytes32 public immutable merkleRoot; // store merkle root for pre-sale airdrop verification
    uint256 public constant MAX_SUPPLY = 10; // Max Supply of NFTs of 10 (I only wanted to make 10 impages with metadata for a test project)
    uint256 public tokenSupply = 0; // Keep track of how many tokens have been minted

    // Keep track of how many NFTs should be sold in the airdrop, Pre-Sale, and Public-Sale periods
    uint256 private airdropSupply;
    uint256 private preSaleSupply;
    uint256 private publicSaleSupply;

    // Set prices for the Pre-Sale and Public Sale
    uint256 private preSalePrice = 0.01 ether;
    uint256 private publicSalePrice = 0.03 ether;

    // Globals for tracking how expensive a mapping of address --> bool is compared to a bitmap
    // Set the bitmap = the MAX INT to initalize at contract creation
    mapping(uint256 => bool) private expensiveAirdropMinted;
    uint256 private airdropMintedBitmap = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff;

    // Mapping for index to ID hash for random ID minting
    // The random ID lives in a struct that holds the hashed value and whether or not it's been revealed
    struct randomStruct {
        bytes32 randomHash;
        uint256 randomId;
        bool revealed;
    }
    mapping(uint256 => randomStruct) public hashedIdMap;
    uint256 private committedIds = 0; // counter to keep track of how many Ids we've randomized and committed (used for state transisiton)
    uint256 private revealedIds = 0; // counter to keep track of how many Ids we've revealed (used for state transisiton)
    uint64 private lastCommitBlock; // to keep track of what the last block was, cannot reaveal any NFTs until each ID is randomized
    mapping(uint256 => bool) private idTracker; // to keep track of which Ids we've already assigned indices

    // State Machine Globals
    enum Stages {
        RandomizeIds,
        RevealIds,
        AirdropMint,
        PreSaleMint,
        PublicSaleMint,
        SoldOut
    }
    Stages public stage = Stages.RandomizeIds;

    /**
     * Events
     */

    // event for a claim of an NFT
    event Claimed(address account, uint256 index);    

    /**
     * Modifiers
     */

    // modifier for verification of merkle proof for claiming airdropped NFTs
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

    // modifer to check that we're in the correct stage of the contract's lifecycle
    modifier checkStage(
        Stages _stage
    ) {
        require(
            stage == _stage,
            "State Machine Error: Incorrect Stage of Contract Lifecycle"
        );
        _;
    }

    /**
     * Constructor
     * @param _merkleRoot root of the merkle tree to verify that a given address is allowed to mint an NFT in the presale
     * @param _airdropSupply number of tokens to be airdropped. 
     * PreSale will be the next 25% of remaining tokens, and public sale is the remainder form there (we're ok with rounding down the presale)
     */
    constructor(bytes32 _merkleRoot, uint256 _airdropSupply) ERC721("Advanced WinnieNFT", "AWN") {
        require(
            _airdropSupply < MAX_SUPPLY, 
            "Constructor Error: Cannot allocate more than MAX SUPPLY for the airdrop"
        );
        merkleRoot = _merkleRoot;
        airdropSupply = _airdropSupply;
        preSaleSupply = (MAX_SUPPLY-airdropSupply)/4;
        publicSaleSupply = MAX_SUPPLY - preSaleSupply - airdropSupply;
    }

    /**
     * Functions
     */

    /**
     * @dev function to commit a randomized ID value for a given index without revealing it
     * @param _index index to commit a random ID for
     * @param _randomHash hashed random number to store for later reveal at NFT minting
     */
    function commitRandomId(uint256 _index, bytes32 _randomHash) public 
        onlyOwner
        checkStage (
            Stages.RandomizeIds
        ) {
            require(hashedIdMap[_index].randomHash == bytes32(0), "Commit Random ID Error: Index Already Committed");
            hashedIdMap[_index].randomHash = _randomHash;
            hashedIdMap[_index].revealed = false;
            lastCommitBlock = uint64(block.number);

            // update state variables
            committedIds++;
            if (committedIds == MAX_SUPPLY) {
                nextStage();
            }
        }

    /**
     * @dev function to commit a randomized ID value for a given index without revealing it
     * @param _index index to commit a random ID for
     * @param _randomHash hashed random number to store for later reveal at NFT minting
     */
    function revealRandomId(uint256 _index, bytes32 _randomHash) public 
        onlyOwner
        checkStage (
            Stages.RevealIds
        ) {
            require(hashedIdMap[_index].revealed==false, "Reveal Random ID: Index value already revealed");
            require(uint64(block.number) >= lastCommitBlock+10, "Reveal Random ID: Need to wait longer before reveal can happen");
            require(_randomHash == hashedIdMap[_index].randomHash, "Reveal Random ID: Incorrect random hash input for this index");

            // generate a random number now between 0 & MAX_SUPPLY-1
            uint256 randomId = uint256(_randomHash)%MAX_SUPPLY;

            // Loop until we find an unused ID
            bool unmatched = true;
            while (unmatched) {

                if (idTracker[randomId]==true) { // ID already taken
                    if (randomId == MAX_SUPPLY-1) { // Current random ID is max value
                        randomId=0;
                    } else {
                        randomId++;
                    }
                }

                else { // Unused ID --> break out of loop 
                    unmatched=false;
                }
            }

            // set correct values in hashedIdMap & idTracker
            hashedIdMap[_index].randomId = randomId;
            hashedIdMap[_index].revealed = true;
            idTracker[randomId] = true;

            // update state variables
            revealedIds++;
            if (revealedIds == MAX_SUPPLY) {
                nextStage();
            }
        }

    /**
     * @dev this function uses a mapping of index => boolean to check if an NFT has already been minted --> do not use
     * @param index index of the nft to be Pre-Minted
     * @param merkleProof merkle proof that the address is allowed to ming the NFT at that index
     */
    function expensiveAirdropMint(uint256 index, bytes32[] calldata merkleProof) public 
        merkleVerified(
            msg.sender,
            index,
            merkleProof
        ) checkStage (
            Stages.AirdropMint
        ) {
            require(expensiveAirdropMinted[index] == false, "Expensive Mint Error: Already Minted");
            expensiveAirdropMinted[index] = true;
            safeMintIndex(msg.sender, index);
            emit Claimed(msg.sender, index);
        }

    /**
     * @dev this function uses a bitmap to check if an NFT has already been minted --> use this
     * @param index index of the nft to be Pre-Minted
     * @param merkleProof merkle proof that the address is allowed to ming the NFT at that index
     */
    function cheapAirdropMint(uint256 index, bytes32[] calldata merkleProof) public 
        merkleVerified(
            msg.sender,
            index,
            merkleProof
        ) checkStage (
            Stages.AirdropMint
        ) {
            require(bitmapCheck(index) == false, "Cheap Mint Error: Already Minted");
            bitmapSet(index);
            safeMintIndex(msg.sender, index);
            emit Claimed(msg.sender, index);
        }

    // get the Public Sale Price
    function getPreSalePrice() public view returns (uint256) {
        return preSalePrice;
    }

    // get the Public Sale Price
    function getPublicSalePrice() public view returns (uint256) {
        return publicSalePrice;
    }

    /**
     * Owner Only Testing Functions
     */

    // function to return the current airdropSupply remaining. restricted to only owner
    function getAirdropSupply() public view onlyOwner returns (uint256) {
        return airdropSupply;
    }

    // function to return the current preSaleSupply remaining. restricted to only owner
    function getPreSaleSupply() public view onlyOwner returns (uint256) {
        return preSaleSupply;
    }

    // function to return the current publicSaleSupply remaining. restricted to only owner
    function getPublicSaleSupply() public view onlyOwner returns (uint256) {
        return publicSaleSupply;
    }

    // retain abaility to change presale price
    function setPreSalePrice(uint256 _newPrice) public onlyOwner {
        preSalePrice = _newPrice;
    }

    // retain abaility to change presale price
    function setPublicSalePrice(uint256 _newPrice) public onlyOwner {
        publicSalePrice = _newPrice;
    }

    // retain abaility to change presale price
    function gethashedIdMapHash(uint256 _index) public view onlyOwner returns (bytes32) {
        return hashedIdMap[_index].randomHash;
    }

    // retain abaility to change presale price
    function gethashedIdMapId(uint256 _index) public view onlyOwner returns (uint256) {
        return hashedIdMap[_index].randomId;
    }

    // retain abaility to change presale price
    function gethashedIdMapReveal(uint256 _index) public view onlyOwner returns (bool) {
        return hashedIdMap[_index].revealed;
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
        return airdropMintedBitmap & (1 << (index & 0xff)) == 0;
    }

    // function to set a bitmap index value to 0 (representing a true value)
    function bitmapSet(uint256 index) internal {
        airdropMintedBitmap &= ~(1 << (index & 0xff));
    }

    // function to set a bitmap index value to 1 (representing a false value)
    function bitmapUnSet(uint256 index) internal {
        airdropMintedBitmap |= 1 << (index & 0xff);
    }

    // function to set a bitmap index value to the value in value
    function bitmapSetValue(uint256 index, bool value) internal {
        if (value) {
            bitmapSet(index);
        } else {
            bitmapUnSet(index);
        }
    }

    // adjust the airdropSupply variable and move us to the next state if needed
    function adjustAirdropSupply() internal checkStage(Stages.AirdropMint) {
        airdropSupply--;
        tokenSupply++;
        if (airdropSupply == 0) {
            nextStage();
        }
    }

    // adjust the preSaleSupply variable and move us to the next state if needed
    function adjustPreSaleSupply() internal checkStage(Stages.PreSaleMint) {
        preSaleSupply--;
        tokenSupply++;
        if (preSaleSupply == 0) {
            nextStage();
        }
    }

    // adjust the publicSaleSupply variable and move us to the next state if needed
    function adjustPublicSaleSupply() internal checkStage(Stages.PublicSaleMint) {
        publicSaleSupply--;
        tokenSupply++;
        if (publicSaleSupply == 0) {
            nextStage();
        }
    }

    // function to mint the Token ID at a given index in the revealed HashMap
    function safeMintIndex(address _to, uint256 _index) internal {
        require(hashedIdMap[_index].revealed==true, "Minting Error: Cannot mint this index. Not Revealed Yet");
        _safeMint(_to, hashedIdMap[_index].randomId);
    }

    // move us to the next stage in the lifecycle of the contract
    function nextStage() internal {
        stage = Stages(uint(stage)+1);
        // check to make sure we don't get stuck with one of the sections having a 0 supply
        if ((stage == Stages.AirdropMint) && (airdropSupply == 0)) {
            nextStage();
        }
        if ((stage == Stages.PreSaleMint) && (preSaleSupply == 0)) {
            nextStage();
        }
        if ((stage == Stages.PublicSaleMint) && (publicSaleSupply == 0)) {
            nextStage();
        }
    }
}
