// SPDX-License-Identifier: MIT
// Creators: ForGloryGame

pragma solidity ^0.8.4;

import { ERC721GMock } from "./ERC721GMock.sol";

contract ERC721GStartIdMock is ERC721GMock {
  constructor(string memory name_, string memory symbol_) ERC721GMock(name_, symbol_) {}

  function _startTokenId() internal view virtual override returns (uint256) {
    return 10;
  }
}
