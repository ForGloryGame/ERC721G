/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { ERC721AMock, ERC721EnumerableMock, ERC721GMock } from "../typechain";

describe("ERC721G.gas.ts", async () => {
  let deployer: SignerWithAddress;
  let alice: SignerWithAddress;
  let erc721g: ERC721GMock;
  let erc721o: ERC721EnumerableMock;
  let erc721a: ERC721AMock;

  beforeEach(async () => {
    [deployer, alice] = await ethers.getSigners();
    const ERC721GMock = await ethers.getContractFactory("ERC721GMock", deployer);
    erc721g = await ERC721GMock.deploy("X", "Y");

    const ERC721EnumerableMock = await ethers.getContractFactory("ERC721EnumerableMock", deployer);
    erc721o = await ERC721EnumerableMock.deploy("X", "Y");

    const ERC721AMock = await ethers.getContractFactory("ERC721AMock", deployer);
    erc721a = await ERC721AMock.deploy("X", "Y");

    // make global storage non-zero for fair compare.
    await erc721o.mint(alice.address, 1);
    await erc721g.mint(alice.address, 1);
    await erc721a.mint(alice.address, 1);
  });

  context("ERC721G", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 1);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 2);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 3);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 4);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 5);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 10);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 20);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721g.mint(deployer.address, 30);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721 Openzeppelin without traits", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 1);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 2);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 3);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 4);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 5);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 10);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 20);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721o.mint(deployer.address, 30);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721A without traits", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 1);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 2);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 3);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 4);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 5);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 10);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 20);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721a.mint(deployer.address, 30);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721 Openzeppelin with traits, compacted", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 1, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 2, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 3, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 4, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 5, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 10, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 20, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 30, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721A with traits, compacted", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 1, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 2, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 3, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 4, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 5, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 10, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 20, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 30, true);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721 Openzeppelin with traits, no compacted", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 1, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 2, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 3, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 4, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 5, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 10, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 20, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721o.mintWithTraits(deployer.address, 30, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });

  context("ERC721A with traits, no compacted", async () => {
    it("show gas for mint 1 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 1, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 2 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 2, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 3 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 3, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 4 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 4, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 5 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 5, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 10 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 10, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 20 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 20, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
    it("show gas for mint 30 NFT", async () => {
      const tx = await erc721a.mintWithTraits(deployer.address, 30, false);
      const receipt = await tx.wait();
      console.log("gas usage:", receipt.gasUsed.toString());
    });
  });
});
