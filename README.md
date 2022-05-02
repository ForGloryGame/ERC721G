# ERC721G

## About The Project

There are two famous ERC721 implementation: [Openzeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts) and [ERC721A](https://github.com/chiru-labs/ERC721A). The Openzeppelin's implementation is suitable for 100% on-chain usage, but it costs too much gas when mint, transfer and burn. The ERC721A's implementation is optimized for batch mint, tranfer and burn, but the on-chain enumeration costs too much gas. In addition, both Openzeppelin and ERC721A's implementation aren't optimized for on-chain traits store, which is common feature used by various On-Chain NFT Games.

So, the ForGloryGame Team implement the ERC721G, to provide a fully compliant implementation of IERC721 with significant gas savings for mint, tranfer, burn, enumeration and traits store. We aims to provide the best ERC721 implementation for On-Chain NFT Games and other projects with on-chain traits.

**This code is still in beta and undergoing reviews. ForGloryGame Team is not liable for any outcomes as a result of using ERC721G. DYOR.**

## Usage

Once installed, you can use the contracts in the library by importing them:

We will setup the npm package very soon.

```solidity
pragma solidity ^0.8.4;

import { ERC721G } from "erc721g/contracts/ERC721G.sol";

contract GloryGameNFT is ERC721G {
  constructor() ERC721G("GloryGameNFT", "GLORY") {}

  function mint(uint256 quantity, uint48 traits) external payable {
    for (uint256 i = 0; i < quantity; i++) {
      _mint(to, traits);
    }
  }
}

```

or the upgradeable version

```solidity
pragma solidity ^0.8.4;

import { ERC721GUpgradeable } from "erc721g/contracts/upgradeable/ERC721GUpgradeable.sol";

contract GloryGameNFT is ERC721GUpgradeable {
  function initialize(string memory name_, string memory symbol_) external initializer {
    __ERC721_init(name_, symbol_);
  }

  function mint(uint256 quantity, uint48 traits) external payable {
    for (uint256 i = 0; i < quantity; i++) {
      _mint(to, traits);
    }
  }
}

```

## Running tests locally

1. `yarn install`
2. `yarn test`

## TODO

- [ ] Improve general repo and code quality (workflows, comments, etc.)
- [ ] Add more documentation on benefits of using ERC721G
- [ ] Add batch mint version like ERC721A.

See the open issues for a full list of proposed features (and known issues).

## License

Distributed under the MIT License. See [LICENSE.txt](./LICENSE.txt) for more information.

## Experiments

Assume the number of bits used to store traits is `48`, the following tables are the gas usage for [Openzeppelin](./contracts/mocks/ERC721EnumerableMock.sol), [ERC721A](./contracts/mocks/ERC721AMock.sol) and [ERC721G](./contracts/mocks/ERC721AMock.sol).

- Gas usage table that no traits are stored on-chain.

| NFT Minted | Openzeppelin (no traits) | ERC721A (no traits) | ERC721G (no traits) |
| :--------: | :----------------------: | :-----------------: | :-----------------: |
|     1      |          143391          |        73726        |        75234        |
|     2      |          257812          |        75690        |       102096        |
|     3      |          128958          |        77654        |       128958        |
|     4      |          486654          |        79618        |       155820        |
|     5      |          601075          |        81582        |       182683        |
|     10     |         1173180          |        91402        |       317004        |
|     20     |         2317390          |       111042        |       585674        |
|     30     |         3461600          |       130682        |       854383        |

- Gas usage table that extra traits in Openzeppelin and ERC721A are stored in single `uint256`.

| NFT Minted | Openzeppelin (with traits) | ERC721A (with traits) | ERC721G (with traits) |
| :--------: | :------------------------: | :-------------------: | :-------------------: |
|     1      |           165873           |         96470         |         75234         |
|     2      |           302601           |        120858         |        102096         |
|     3      |           439329           |        145246         |        128958         |
|     4      |           576057           |        169634         |        155820         |
|     5      |           712785           |        194022         |        182683         |
|     10     |          1396425           |        315962         |        317004         |
|     20     |          2763705           |        559842         |        585674         |
|     30     |          4130985           |        803722         |        854383         |

- Gas usafe table that every 5 extra traits are packed into single `uint256`.

| NFT Minted | Openzeppelin (with traits) | ERC721A (with traits) | ERC721G (with traits) |
| :--------: | :------------------------: | :-------------------: | :-------------------: |
|     1      |           165931           |         96528         |         75234         |
|     2      |           280805           |         99062         |        102096         |
|     3      |           395679           |        101596         |        128958         |
|     4      |           510553           |        104130         |        155820         |
|     5      |           647327           |        128564         |        182683         |
|     10     |          1243597           |        163134         |        317004         |
|     20     |          2436137           |        232274         |        585674         |
|     30     |          3628677           |        301414         |        854383         |
