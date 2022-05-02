// SPDX-License-Identifier: MIT
// Creator: ForGloryGame

pragma solidity ^0.8.4;

import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC721Receiver } from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { Context } from "@openzeppelin/contracts/utils/Context.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { ERC165, IERC165 } from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import { IERC721G, IERC721Metadata, IERC721Enumerable } from "./interfaces/IERC721G.sol";

// solhint-disable reason-string

/// @title Implementation of https://eips.ethereum.org/EIPS/eip-721[ERC721] Non-Fungible Token Standard, including
/// the Metadata and Enumerable extension.
///
/// @dev This contract is inspired by [ERC721A](https://github.com/chiru-labs/ERC721A/blob/main/contracts/ERC721A.sol).
///
/// Some gas optimizations:
///   + All token owner information and all token information are packed into single 256-bits word.
///   + Maintain a token linked list of each token owner for fast on chain enumeration.
///
/// Some assumptions:
///   + All tokens are sequentially minted starting at _startTokenId() (defaults to 0, e.g. 0, 1, 2, 3..).
///   + An owner cannot have more than 2**24 - 1 (max value of uint24) of supply.
///   + The maximum token id cannot exceed 2**24 - 1 (max value of uint24).
contract ERC721G is Context, ERC165, IERC721G {
  using Address for address;
  using Strings for uint256;

  /// @dev The token name
  string private _name;

  /// @dev The token symbol
  string private _symbol;

  /// @dev Mapping from token ID to ownership details
  mapping(uint256 => TokenOwnership) private _ownerships;

  /// @dev Mapping owner address to address data
  mapping(address => AddressData) private _addressData;

  /// @dev Mapping from token ID to approved address
  mapping(uint256 => address) private _tokenApprovals;

  /// @dev Mapping from owner to operator approvals
  mapping(address => mapping(address => bool)) private _operatorApprovals;

  /// @dev The tokenId of the next token to be minted.
  uint256 internal _currentIndex;

  /// @dev The number of tokens burned.
  uint256 internal _burnCounter;

  constructor(string memory name_, string memory symbol_) {
    _name = name_;
    _symbol = symbol_;

    _currentIndex = _startTokenId();
  }

  /**************************************** View Function ****************************************/

  /// @notice See {IERC721Metadata-totalSupply}.
  /// @dev use _totalMinted() if you want to count just minted tokens.
  function totalSupply() public view override returns (uint256) {
    // Counter underflow is impossible as _burnCounter cannot be incremented
    // more than _currentIndex - _startTokenId() times
    unchecked {
      return _currentIndex - _burnCounter - _startTokenId();
    }
  }

  /// @notice Returns the list of first `count` tokens owned by the owner.
  /// @dev If the actual tokens are not enough for `count`, a truncated list will be returned.
  /// @param owner The address of owner.
  /// @param count The expected number of token to return.
  function tokensOfOwner(address owner, uint256 count) external view returns (uint256[] memory) {
    AddressData memory _data = _addressData[owner];
    if (count > _data.balance) {
      count = _data.balance;
    }
    uint256[] memory _tokenIds = new uint256[](count);
    uint256 _tokenId = _data.headTokenId;
    TokenOwnership memory _ownership;

    unchecked {
      for (uint256 i = 0; i < count; i++) {
        _tokenIds[i] = _tokenId;
        _ownership = _ownerships[_tokenId];
        _tokenId = _ownership.nextTokenId;
      }
    }

    return _tokenIds;
  }

  /// @notice See {IERC721Enumerable-tokenOfOwnerByIndex}.
  /// @dev The time complexity is `O(index)`, use `tokensOfOwner` for fast batch enumeration.
  function tokenOfOwnerByIndex(address owner, uint256 index) external view override returns (uint256) {
    AddressData memory _data = _addressData[owner];
    require(index < _data.balance, "ERC721Enumerable: owner index out of bounds");
    uint256 _count;
    uint256 _tokenId = _data.headTokenId;
    TokenOwnership memory _ownership;
    while (_count < index) {
      _ownership = _ownerships[_tokenId];
      _tokenId = _ownership.nextTokenId;
      unchecked {
        _count += 1;
      }
    }
    return _tokenId;
  }

  /// @notice See {IERC721Enumerable-tokenByIndex}.
  /// @dev This function is very slow, it is not recommend to use in contract call.
  ///
  /// If the burn is not supported for the NFT, you can just use `_startTokenId() + _index` to
  /// get the correct token id.
  function tokenByIndex(uint256 _index) external view override returns (uint256) {
    // if no token is burned, we can compute the index directly.
    if (_burnCounter == 0) {
      unchecked {
        uint256 _start = _startTokenId();
        require(_index < _currentIndex - _start, "ERC721Enumerable: global index out of bounds");
        return _start + _index;
      }
    }

    uint256 _maxIndex = _currentIndex;
    uint256 _count;
    for (uint256 i = _startTokenId(); i < _maxIndex; i++) {
      if (_ownerships[i].owner != address(0)) {
        if (_count == _index) return i;
        _count += 1;
      }
    }
    revert("ERC721Enumerable: global index out of bounds");
  }

  /// @notice See {IERC165-supportsInterface}.
  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
    return
      interfaceId == type(IERC721).interfaceId ||
      interfaceId == type(IERC721Metadata).interfaceId ||
      super.supportsInterface(interfaceId);
  }

  /// @notice See {IERC721-balanceOf}.
  function balanceOf(address owner) public view override returns (uint256) {
    require(owner != address(0), "ERC721: balance query for the zero address");
    return uint256(_addressData[owner].balance);
  }

  /// @notice See {IERC721-ownerOf}.
  function ownerOf(uint256 tokenId) public view override returns (address) {
    TokenOwnership memory ownership = _ownerships[tokenId];
    require(ownership.owner != address(0), "ERC721: owner query for nonexistent token");
    return _ownerships[tokenId].owner;
  }

  /// @notice See {IERC721Metadata-name}.
  function name() public view virtual override returns (string memory) {
    return _name;
  }

  /// @notice See {IERC721Metadata-symbol}.
  function symbol() public view virtual override returns (string memory) {
    return _symbol;
  }

  /// @notice See {IERC721Metadata-tokenURI}.
  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

    string memory baseURI = _baseURI();
    return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
  }

  /// @notice See {IERC721-getApproved}.
  function getApproved(uint256 tokenId) public view override returns (address) {
    require(_exists(tokenId), "ERC721: approved query for nonexistent token");

    return _tokenApprovals[tokenId];
  }

  /// @notice See {IERC721-isApprovedForAll}.
  function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
    return _operatorApprovals[owner][operator];
  }

  /**************************************** Mutate Function ****************************************/

  /// @notice See {IERC721-approve}.
  function approve(address to, uint256 tokenId) public override {
    address owner = ERC721G.ownerOf(tokenId);
    require(to != owner, "ERC721: approval to current owner");

    require(
      _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
      "ERC721: approve caller is not owner nor approved for all"
    );

    _approve(to, tokenId, owner);
  }

  /// @notice See {IERC721-setApprovalForAll}.
  function setApprovalForAll(address operator, bool approved) public virtual override {
    address owner = _msgSender();
    require(owner != operator, "ERC721: approve to caller");

    _operatorApprovals[owner][operator] = approved;
    emit ApprovalForAll(owner, operator, approved);
  }

  /// @notice See {IERC721-transferFrom}.
  function transferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public virtual override {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
    _transfer(from, to, tokenId);
  }

  /// @notice See {IERC721-safeTransferFrom}.
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId
  ) public virtual override {
    safeTransferFrom(from, to, tokenId, "");
  }

  /// @notice See {IERC721-safeTransferFrom}.
  function safeTransferFrom(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) public virtual override {
    require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

    _safeTransfer(from, to, tokenId, _data);
  }

  /**************************************** Internal Function ****************************************/

  /// @dev To change the starting tokenId, please override this function.
  function _startTokenId() internal view virtual returns (uint256) {
    return 0;
  }

  /// @dev Returns the total amount of tokens minted in the contract.
  function _totalMinted() internal view returns (uint256) {
    // Counter underflow is impossible as `_currentIndex` does not decrement,
    // and it is initialized to `_startTokenId()`
    unchecked {
      return _currentIndex - _startTokenId();
    }
  }

  /// @dev Returns the number of tokens minted by `owner`.
  function _numberMinted(address owner) internal view returns (uint256) {
    return uint256(_addressData[owner].numberMinted);
  }

  /// @dev Returns the number of tokens burned by or on behalf of `owner`.
  function _numberBurned(address owner) internal view returns (uint256) {
    return uint256(_addressData[owner].numberBurned);
  }

  /// @dev Returns the auxillary data for `owner`. (e.g. number of whitelist mint slots used).
  function _getOwnerAux(address owner) internal view returns (uint136) {
    return _addressData[owner].aux;
  }

  /// @dev Sets the auxillary data for `owner`. (e.g. number of whitelist mint slots used).
  /// If there are multiple variables, please pack them into a uint136.
  function _setOwnerAux(address owner, uint136 aux) internal {
    _addressData[owner].aux = aux;
  }

  /// @dev Returns the auxillary data for `tokenId`.
  function _getTokenAux(uint256 tokenId) internal view returns (uint48) {
    return _ownerships[tokenId].aux;
  }

  /// @dev Sets the auxillary data for `tokenId`.
  ///
  /// If there are multiple variables, please pack them into a uint48.
  function _setTokenAux(uint256 tokenId, uint48 aux) internal {
    _ownerships[tokenId].aux = aux;
  }

  /// @dev Returns whether `tokenId` exists.
  ///
  /// Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
  ///
  /// Tokens start existing when they are minted (`_mint`), and stop existing when they are burned (`_burn`).
  function _exists(uint256 tokenId) internal view returns (bool) {
    return _ownerships[tokenId].owner != address(0);
  }

  /// @dev Returns whether `spender` is allowed to manage `tokenId`.
  ///
  /// This functon will revert if the `tokenId` does not exist.
  function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
    require(_exists(tokenId), "ERC721: operator query for nonexistent token");
    address owner = ERC721G.ownerOf(tokenId);
    return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
  }

  /// @dev Internal function to safely mint a token and transfers it to `to`.
  ///
  /// Requirements:
  ///
  /// - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is
  ///   called upon a safe transfer.
  ///
  /// Emits a {Transfer} event.
  function _safeMint(address to, uint48 aux) internal {
    _safeMint(to, aux, "");
  }

  /// @dev Same as {xref-ERC721G-_safeMint-address-}[`_safeMint`], with an additional `data` parameter which is
  /// forwarded in {IERC721Receiver-onERC721Received} to contract recipients.
  function _safeMint(
    address to,
    uint48 aux,
    bytes memory _data
  ) internal {
    uint256 tokenId = _mint(to, aux);
    require(
      _checkOnERC721Received(address(0), to, tokenId, _data),
      "ERC721: transfer to non ERC721Receiver implementer"
    );
  }

  /// @dev Internal function to mint `tokenId` and transfers it to `to`.
  ///
  /// WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
  ///
  /// Requirements:
  ///
  /// - `to` cannot be the zero address.
  ///
  /// Emits a {Transfer} event.
  function _mint(address to, uint48 aux) internal returns (uint256) {
    require(to != address(0), "ERC721: mint to the zero address");
    uint256 tokenId = _currentIndex;
    require(tokenId < type(uint24).max, "ERC721G: token id exceed maximum");
    unchecked {
      _currentIndex = tokenId + 1;
    }

    _beforeTokenTransfer(address(0), to, tokenId);

    _addTokenTo(to, tokenId, true, aux);

    emit Transfer(address(0), to, tokenId);

    _afterTokenTransfer(address(0), to, tokenId);

    return tokenId;
  }

  /// @dev Internal function to safely transfer `tokenId` token from `from` to `to`, checking first that contract
  /// recipients are aware of the ERC721 protocol to prevent tokens from being forever locked.
  ///
  /// `_data` is additional data, it has no specified format and it is sent in call to `to`.
  ///
  /// This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
  /// implement alternative mechanisms to perform token transfer, such as signature-based.
  ///
  /// Requirements:
  ///
  /// - `from` cannot be the zero address.
  /// - `to` cannot be the zero address.
  /// - `tokenId` token must exist and be owned by `from`.
  /// - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called
  ///   upon a safe transfer.
  ///
  /// Emits a {Transfer} event.
  function _safeTransfer(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) internal virtual {
    _transfer(from, to, tokenId);
    require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
  }

  /// @dev Internal function to transfer `tokenId` from `from` to `to`.
  ///
  /// Requirements:
  ///
  /// - `to` cannot be the zero address.
  /// - `tokenId` token must be owned by `from`.
  ///
  /// Emits a {Transfer} event.
  function _transfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {
    require(ERC721G.ownerOf(tokenId) == from, "ERC721: transfer from incorrect owner");
    require(to != address(0), "ERC721: transfer to the zero address");

    _beforeTokenTransfer(from, to, tokenId);

    // Clear approvals from the previous owner
    _approve(address(0), tokenId, from);

    _removeTokenFrom(from, tokenId, false);

    _addTokenTo(to, tokenId, false, 0);

    emit Transfer(from, to, tokenId);

    _afterTokenTransfer(from, to, tokenId);
  }

  /// @dev This is equivalent to _burn(tokenId, false)
  function _burn(uint256 tokenId) internal virtual {
    _burn(tokenId, false);
  }

  /// @dev Destroys `tokenId`.
  /// The approval is cleared when the token is burned.
  ///
  /// Requirements:
  ///
  /// - `tokenId` must exist.
  ///
  /// Emits a {Transfer} event.
  function _burn(uint256 tokenId, bool approvalCheck) internal virtual {
    if (approvalCheck) {
      require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
    }

    address owner = ERC721G.ownerOf(tokenId);

    _beforeTokenTransfer(owner, address(0), tokenId);

    // Clear approvals
    _approve(address(0), tokenId, owner);

    _removeTokenFrom(owner, tokenId, true);

    emit Transfer(owner, address(0), tokenId);

    _afterTokenTransfer(owner, address(0), tokenId);

    unchecked {
      _burnCounter += 1;
    }
  }

  /// @dev Internal function to approve `to` to operate on `tokenId`
  ///
  /// Emits a {Approval} event.
  function _approve(
    address to,
    uint256 tokenId,
    address owner
  ) private {
    _tokenApprovals[tokenId] = to;
    emit Approval(owner, to, tokenId);
  }

  /// @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
  /// The call is not executed if the target address is not a contract.
  ///
  /// @param from address representing the previous owner of the given token ID
  /// @param to target address that will receive the tokens
  /// @param tokenId uint256 ID of the token to be transferred
  /// @param _data bytes optional data to send along with the call
  /// @return bool whether the call correctly returned the expected magic value
  function _checkOnERC721Received(
    address from,
    address to,
    uint256 tokenId,
    bytes memory _data
  ) private returns (bool) {
    if (to.isContract()) {
      try IERC721Receiver(to).onERC721Received(_msgSender(), from, tokenId, _data) returns (bytes4 retval) {
        return retval == IERC721Receiver.onERC721Received.selector;
      } catch (bytes memory reason) {
        if (reason.length == 0) {
          revert("ERC721: transfer to non ERC721Receiver implementer");
        } else {
          // solhint-disable-next-line no-inline-assembly
          assembly {
            revert(add(32, reason), mload(reason))
          }
        }
      }
    } else {
      return true;
    }
  }

  /// @dev Internal function to add a token with id `tokenId` to `to`.
  ///
  /// @param to The address who will recieve the token.
  /// @param tokenId uint256 ID of the token to be added.
  /// @param isMint whether this is called by a `_mint` function.
  /// @param aux The aux data to set when `isMint` is true.
  function _addTokenTo(
    address to,
    uint256 tokenId,
    bool isMint,
    uint48 aux
  ) private {
    unchecked {
      TokenOwnership memory ownership = _ownerships[tokenId];
      AddressData memory addressData = _addressData[to];
      if (addressData.balance == 0) {
        addressData.headTokenId = uint24(tokenId);
        addressData.tailTokenId = uint24(tokenId);
      } else {
        _ownerships[addressData.headTokenId].prevTokenId = uint24(tokenId);
        ownership.nextTokenId = addressData.headTokenId;
        addressData.headTokenId = uint24(tokenId);
      }

      ownership.owner = to;
      addressData.balance += 1;
      if (isMint) {
        ownership.aux = aux;
        addressData.numberMinted += 1;
      }

      _ownerships[tokenId] = ownership;
      _addressData[to] = addressData;
    }
  }

  /// @dev Internal function to remove a token with id `tokenId` from `from`.
  ///
  /// @param from The address who will remove the token.
  /// @param tokenId uint256 ID of the token to be added.
  /// @param isBurn whether this is called by a `_burn` function.
  function _removeTokenFrom(
    address from,
    uint256 tokenId,
    bool isBurn
  ) private {
    unchecked {
      TokenOwnership memory ownership = _ownerships[tokenId];
      AddressData memory addressData = _addressData[from];

      if (addressData.headTokenId == tokenId) {
        // remove head token
        addressData.headTokenId = ownership.nextTokenId;
      } else if (addressData.tailTokenId == tokenId) {
        // remove tail token
        addressData.tailTokenId = ownership.prevTokenId;
      } else {
        // remove middle token
        _ownerships[ownership.prevTokenId].nextTokenId = ownership.nextTokenId;
        _ownerships[ownership.nextTokenId].prevTokenId = ownership.prevTokenId;
      }

      ownership.owner = address(0);
      addressData.balance -= 1;
      if (isBurn) {
        addressData.numberBurned += 1;
      }

      _ownerships[tokenId] = ownership;
      _addressData[from] = addressData;
    }
  }

  /// @dev Hook that is called before any token transfer. This includes minting
  /// and burning.
  ///
  /// Calling conditions:
  ///
  /// - When `from` and `to` are both non-zero, ``from``'s `tokenId` will be
  /// transferred to `to`.
  /// - When `from` is zero, `tokenId` will be minted for `to`.
  /// - When `to` is zero, ``from``'s `tokenId` will be burned.
  /// - `from` and `to` are never both zero.
  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {}

  /// @dev Hook that is called after any transfer of tokens. This includes minting and burning.
  ///
  ///
  /// Calling conditions:
  ///
  /// - when `from` and `to` are both non-zero.
  /// - `from` and `to` are never both zero.
  function _afterTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual {}

  /// @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
  /// token will be the concatenation of the `baseURI` and the `tokenId`. Empty
  /// by default, can be overridden in child contracts.
  function _baseURI() internal view virtual returns (string memory) {
    return "";
  }
}
