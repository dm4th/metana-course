// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";     // Make sure we only run initialize once
// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";                      // Need to use upgradeable version
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";                         // Need to use upgradeable version
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract WinnieNFTV2 is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    using SafeMath for uint256;
    using Address for address;

    address public _minter;

    uint256 private tokenSupply;
    uint256 public constant MAX_SUPPLY = 10;

    // Add events for off-chain applications
    event ChangeMinter(address _newMinter);

    // No constructor becuase we need to use as proxy
    // constructor() ERC721("Winnie", "WNE") {
    //     _minter = address(0);
    // }

    // function initialize(string memory name_, string memory symbol_) public initializer {
    //     _minter = address(0);
    //     tokenSupply = 0;
    //     __ERC721_init(name_, symbol_);
    //     __Ownable_init_unchained();
    // }

    function mint(address to) external {
        // check that we haven't exceeded the max number of tokens
        require(tokenSupply < MAX_SUPPLY, "Supply Used Up!!");

        // use the built-in ERC721 mint function - mint token directly to the minter
        _mint(to, tokenSupply);
        // increment the total supply counter
        tokenSupply++;
    }

    function changeMinter(address newMinter) public virtual onlyOwner{
        require(newMinter.isContract() || newMinter == address(0), "New Minter Address must be another contract!!");
        _minter = newMinter;
        
        emit ChangeMinter(newMinter);
    }

    function _baseURI() internal pure override returns(string memory) {
        return "ipfs://QmSvxH2m5SXoxB8qv4QcZXk5Qjx3p3DawQaXJHjbBfVqyC/";
    }

    /**
     * New Function for V2 of the contract -- force transfer of NFTs
     * @param tokenId token ID to force transfer
     * @param to address to send it to
     */
    function forceTransfer(uint256 tokenId, address to) external onlyOwner {
        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);
    }
}