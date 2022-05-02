// SPDX-License-Identifier: MIT
// Creator: ForGloryGame

pragma solidity ^0.8.4;

import { ERC721Enumerable, ERC721 } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ERC721EnumerableMock is ERC721Enumerable {
  // for fair compare, every 5 48-bits traits are packed into a single uint256.
  mapping(uint256 => uint256) public traits;
  mapping(uint256 => uint256) public traitsNoCompacted;

  constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

  function mint(address to, uint256 quantity) public {
    uint256 _startId = totalSupply();
    for (uint256 i = 0; i < quantity; i++) {
      _mint(to, _startId + i);
    }
  }

  function mintWithTraits(
    address to,
    uint256 quantity,
    bool compacted
  ) public {
    uint256 _startId = totalSupply();
    for (uint256 i = 0; i < quantity; i++) {
      _mint(to, _startId + i);
      _setTraits(_startId + i, 1, compacted);
    }
  }

  function _setTraits(
    uint256 tokenId,
    uint48 _traits,
    bool compacted
  ) internal {
    if (compacted) {
      unchecked {
        uint256 _index = tokenId / 5;
        uint256 _rem = tokenId % 5;
        traits[_index] |= uint256(_traits) << (_rem * 48);
      }
    } else {
      traitsNoCompacted[tokenId] = _traits;
    }
  }
}
