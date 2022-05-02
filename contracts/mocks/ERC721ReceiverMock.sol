// SPDX-License-Identifier: MIT
// Creator: ForGloryGame

pragma solidity ^0.8.4;

import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract ERC721ReceiverMock is IERC721Receiver {
  enum Error {
    None,
    RevertWithMessage,
    RevertWithoutMessage,
    Panic
  }

  bytes4 private immutable _retval;
  bool private immutable _willRevert;

  event Received(address operator, address from, uint256 tokenId, bytes data, uint256 gas);

  constructor(bytes4 retval, bool willRevert) {
    _retval = retval;
    _willRevert = willRevert;
  }

  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes memory data
  ) public override returns (bytes4) {
    if (_willRevert) {
      revert("ReceiverMock revert");
    }
    emit Received(operator, from, tokenId, data, 20000);
    return _retval;
  }
}
