// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract HandValentine is ERC721URIStorage, Ownable {

    mapping(uint256 => string) private _tokenURIs;

    mapping(address => uint) public mintedNFTs;

    uint constant public MAX_SUPPLY = 5555;
    
    uint constant public PRICE = 0.02 ether;

    uint public maxMintsPerWallet = 15;
    
    uint256 public counter = 1;

    address public authorizedSigner = 0x5172c410aD20d27763c686Ada1458d2c00e145D3;

    uint public totalSupply;

    constructor() ERC721 ("Hand Valentines", "HNDV") {
    }

    // Setters region
    function setMaxMintsPerWallet(uint _maxMintsPerWallet) external onlyOwner {
        maxMintsPerWallet = _maxMintsPerWallet;
    }

    function setAuthorizedSigner(address _authorizedSigner) external onlyOwner {
        authorizedSigner = _authorizedSigner;
    }

    function configure(
        uint _maxMintsPerWallet,
        address _authorizedSigner
    ) external onlyOwner {
        maxMintsPerWallet = _maxMintsPerWallet;
        authorizedSigner = _authorizedSigner;
    }
    // endregion

    function _baseURI(uint tokenId) internal view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // mint 
    function publicMint(string memory tokenURI) public payable {
        require(counter < MAX_SUPPLY, "Tokens supply reached limit");
        require(mintedNFTs[msg.sender] + 1 <= maxMintsPerWallet, "maxMintsPerWallet constraint violation");
        require(msg.value == PRICE, "Minimum token price is 0.02 ETH.");

        mintedNFTs[msg.sender]++;
        _safeMint(_msgSender(), counter);
        _setTokenURI(counter, tokenURI);
    }

    receive() external payable {
    }

    function withdraw() external onlyOwner {
        uint percent = address(this).balance / 100;
        payable(authorizedSigner).transfer(percent * 100);
    }
}