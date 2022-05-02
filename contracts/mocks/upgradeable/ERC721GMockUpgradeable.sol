// SPDX-License-Identifier: MIT
// Creators: ForGloryGame

pragma solidity ^0.8.4;

import { ERC721GUpgradeable } from "../../upgradeable/ERC721GUpgradeable.sol";

contract ERC721GMockUpgradeable is ERC721GUpgradeable {
  function initialize(string memory name_, string memory symbol_) external initializer {
    __ERC721_init(name_, symbol_);
  }

  function numberMinted(address owner) public view returns (uint256) {
    return _numberMinted(owner);
  }

  function numberBurned(address owner) public view returns (uint256) {
    return _numberBurned(owner);
  }

  function totalMinted() public view returns (uint256) {
    return _totalMinted();
  }

  function getOwnerAux(address owner) public view returns (uint136) {
    return _getOwnerAux(owner);
  }

  function setOwnerAux(address owner, uint136 aux) public {
    _setOwnerAux(owner, aux);
  }

  function getTokenAux(uint256 _tokenId) public view returns (uint48) {
    return _getTokenAux(_tokenId);
  }

  function setTokenAux(uint256 _tokenId, uint48 aux) public {
    _setTokenAux(_tokenId, aux);
  }

  function baseURI() public view returns (string memory) {
    return _baseURI();
  }

  function exists(uint256 tokenId) public view returns (bool) {
    return _exists(tokenId);
  }

  function safeMint(address to, uint256 quantity) public {
    for (uint256 i = 0; i < quantity; i++) {
      _safeMint(to, 0);
    }
  }

  function safeMint(
    address to,
    uint256 quantity,
    bytes memory _data
  ) public {
    for (uint256 i = 0; i < quantity; i++) {
      _safeMint(to, 0, _data);
    }
  }

  function mint(address to, uint256 quantity) public {
    for (uint256 i = 0; i < quantity; i++) {
      _mint(to, 0);
    }
  }

  function burn(uint256 tokenId, bool approvalCheck) public {
    _burn(tokenId, approvalCheck);
  }

  function startTokenId() public view returns (uint256) {
    return _startTokenId();
  }
}
