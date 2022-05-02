// SPDX-License-Identifier: MIT
// Creator: ForGloryGame

pragma solidity ^0.8.4;

import { IERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import { IERC721MetadataUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721MetadataUpgradeable.sol";
import { IERC721EnumerableUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/IERC721EnumerableUpgradeable.sol";

/// @title The interface for an ERC721G compliant contract.
interface IERC721GUpgradeable is IERC721Upgradeable, IERC721MetadataUpgradeable, IERC721EnumerableUpgradeable {
  // Compiler will pack this into a single 256-bits word.
  struct TokenOwnership {
    // The address of the owner. If it is zero, it means it is burned or not exist.
    address owner;
    // The prev token id in linked list. If current token id is `headTokenId`, it is not used.
    uint24 prevTokenId;
    // The next token id in linked list. If current token id is `tailTokenId`, it is not used.
    uint24 nextTokenId;
    // For miscellaneous variable(s) pertaining to the token
    // If there are multiple variables, please pack them into a uint48.
    uint48 aux;
  }

  // Compiler will pack this into a single 256-bits word.
  struct AddressData {
    // Realistically, 2**24-1 is more than enough.
    uint24 balance;
    // Keeps track of mint count with minimal overhead for tokenomics.
    uint24 numberMinted;
    // Keeps track of burn count with minimal overhead for tokenomics.
    uint24 numberBurned;
    // Keeps track of the head of the linked list.
    uint24 headTokenId;
    // Keeps track of the tail of the linked list.
    uint24 tailTokenId;
    // For miscellaneous variable(s) pertaining to the address
    // (e.g. number of whitelist mint slots used).
    // If there are multiple variables, please pack them into a uint136.
    uint136 aux;
  }
}
