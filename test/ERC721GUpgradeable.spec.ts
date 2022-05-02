/* eslint-disable node/no-missing-import */
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, constants } from "ethers";
import { ethers } from "hardhat";
import { ERC721GMockUpgradeable, ERC721ReceiverMock } from "../typechain";

describe("ERC721GUpgradeable.spec.ts", async () => {
  const StartTokenId = 0;

  let erc721g: ERC721GMockUpgradeable;
  let receiver: ERC721ReceiverMock;
  let receiverWrongReturn: ERC721ReceiverMock;
  let receiverRevert: ERC721ReceiverMock;

  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    const ERC721GMockUpgradeable = await ethers.getContractFactory("ERC721GMockUpgradeable", deployer);
    erc721g = await ERC721GMockUpgradeable.deploy();
    await erc721g.initialize("ERC721G name", "ERC721G symbol");

    const ERC721ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMock", deployer);
    receiver = await ERC721ReceiverMock.deploy("0x150b7a02", false);
    await receiver.deployed();
    receiverWrongReturn = await ERC721ReceiverMock.deploy("0x150b7a03", false);
    await receiverWrongReturn.deployed();
    receiverRevert = await ERC721ReceiverMock.deploy("0x150b7a03", true);
    await receiverRevert.deployed();
  });

  context("EIP-165 support", async () => {
    it("should support IERC721", async () => {
      expect(await erc721g.supportsInterface("0x80ac58cd")).to.eq(true);
    });

    it("should support ERC721Metadata", async () => {
      expect(await erc721g.supportsInterface("0x5b5e139f")).to.eq(true);
    });

    it("should support ERC721Enumerable", async () => {
      expect(await erc721g.supportsInterface("0x780e9d63")).to.eq(false);
    });

    it("should not support random interface", async () => {
      expect(await erc721g.supportsInterface("0x00000042")).to.eq(false);
    });
  });

  context("when just deployed", async () => {
    it("should have 0 totalSupply", async () => {
      expect(await erc721g.totalSupply()).to.equal(0);
    });

    it("should have 0 totalMinted", async () => {
      expect(await erc721g.totalMinted()).to.equal(0);
    });

    it("should have correct startTokenId", async () => {
      expect(await erc721g.startTokenId()).to.eq(StartTokenId);
    });
  });

  context("when some tokens minted", async () => {
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;
    let addr4: SignerWithAddress;

    beforeEach(async () => {
      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
      await erc721g["safeMint(address,uint256)"](addr1.address, 1);
      await erc721g["safeMint(address,uint256)"](addr2.address, 2);
      await erc721g["safeMint(address,uint256)"](addr3.address, 3);
      await erc721g["safeMint(address,uint256)"](addr4.address, 4);
    });

    context("ERC721Metadata support", async () => {
      it("should return the right name", async () => {
        expect(await erc721g.name()).to.eq("ERC721G name");
      });

      it("should return the right symbol", async () => {
        expect(await erc721g.symbol()).to.eq("ERC721G symbol");
      });

      context("tokenURI", async () => {
        it("should return an emtpy uri by default", async () => {
          expect(await erc721g.tokenURI(StartTokenId + 1)).to.eq("");
        });

        it("should revert, when tokenId is invalid", async () => {
          await expect(erc721g.tokenURI(StartTokenId + 42)).to.revertedWith(
            "ERC721Metadata: URI query for nonexistent token"
          );
        });
      });
    });

    context("ERC721Enumerable", async () => {
      context("tokensOfOwner", async () => {
        it("should returns the correct list when count <= balance", async () => {
          expect(await erc721g.tokensOfOwner(owner.address, 0)).to.deep.eq([]);
          expect(await erc721g.tokensOfOwner(addr1.address, 1)).to.deep.eq([BigNumber.from(StartTokenId)]);
          expect(await erc721g.tokensOfOwner(addr2.address, 1)).to.deep.eq([BigNumber.from(StartTokenId + 2)]);
          expect(await erc721g.tokensOfOwner(addr3.address, 2)).to.deep.eq([
            BigNumber.from(StartTokenId + 5),
            BigNumber.from(StartTokenId + 4),
          ]);
        });

        it("should returns the truncated list when count > balance", async () => {
          expect(await erc721g.tokensOfOwner(owner.address, 1)).to.deep.eq([]);
          expect(await erc721g.tokensOfOwner(addr1.address, 2)).to.deep.eq([BigNumber.from(StartTokenId)]);
          expect(await erc721g.tokensOfOwner(addr2.address, 3)).to.deep.eq([
            BigNumber.from(StartTokenId + 2),
            BigNumber.from(StartTokenId + 1),
          ]);
          expect(await erc721g.tokensOfOwner(addr3.address, 4)).to.deep.eq([
            BigNumber.from(StartTokenId + 5),
            BigNumber.from(StartTokenId + 4),
            BigNumber.from(StartTokenId + 3),
          ]);
        });
      });

      context("tokenOfOwnerByIndex", async () => {
        it("should revert, when index out of bounds", async () => {
          await expect(erc721g.tokenOfOwnerByIndex(addr1.address, 1)).to.revertedWith(
            "ERC721Enumerable: owner index out of bounds"
          );
          await expect(erc721g.tokenOfOwnerByIndex(addr2.address, 2)).to.revertedWith(
            "ERC721Enumerable: owner index out of bounds"
          );
          await expect(erc721g.tokenOfOwnerByIndex(addr3.address, 3)).to.revertedWith(
            "ERC721Enumerable: owner index out of bounds"
          );
        });

        it("should return the correct tokenId", async () => {
          expect(await erc721g.tokenOfOwnerByIndex(addr1.address, 0)).to.eq(BigNumber.from(StartTokenId));
          expect(await erc721g.tokenOfOwnerByIndex(addr2.address, 0)).to.eq(BigNumber.from(StartTokenId + 2));
          expect(await erc721g.tokenOfOwnerByIndex(addr2.address, 1)).to.eq(BigNumber.from(StartTokenId + 1));
          expect(await erc721g.tokenOfOwnerByIndex(addr3.address, 0)).to.eq(BigNumber.from(StartTokenId + 5));
          expect(await erc721g.tokenOfOwnerByIndex(addr3.address, 1)).to.eq(BigNumber.from(StartTokenId + 4));
          expect(await erc721g.tokenOfOwnerByIndex(addr3.address, 2)).to.eq(BigNumber.from(StartTokenId + 3));
        });
      });

      context("tokenByIndex", async () => {
        it("sbould revert, when index out of bounds without burn", async () => {
          await expect(erc721g.tokenByIndex(10)).to.revertedWith("ERC721Enumerable: global index out of bounds");
        });

        it("sbould revert, when index out of bounds after burn", async () => {
          await erc721g.burn(StartTokenId, false);
          await expect(erc721g.tokenByIndex(10)).to.revertedWith("ERC721Enumerable: global index out of bounds");
        });

        it("should return the correct tokenId without burn", async () => {
          expect(await erc721g.tokenByIndex(0)).to.eq(BigNumber.from(StartTokenId));
          expect(await erc721g.tokenByIndex(1)).to.eq(BigNumber.from(StartTokenId + 1));
          expect(await erc721g.tokenByIndex(2)).to.eq(BigNumber.from(StartTokenId + 2));
          expect(await erc721g.tokenByIndex(3)).to.eq(BigNumber.from(StartTokenId + 3));
          expect(await erc721g.tokenByIndex(4)).to.eq(BigNumber.from(StartTokenId + 4));
          expect(await erc721g.tokenByIndex(5)).to.eq(BigNumber.from(StartTokenId + 5));
        });

        it("should return the correct tokenId with burn", async () => {
          await erc721g.burn(StartTokenId + 3, false);
          expect(await erc721g.tokenByIndex(0)).to.eq(BigNumber.from(StartTokenId));
          expect(await erc721g.tokenByIndex(1)).to.eq(BigNumber.from(StartTokenId + 1));
          expect(await erc721g.tokenByIndex(2)).to.eq(BigNumber.from(StartTokenId + 2));
          expect(await erc721g.tokenByIndex(3)).to.eq(BigNumber.from(StartTokenId + 4));
          expect(await erc721g.tokenByIndex(4)).to.eq(BigNumber.from(StartTokenId + 5));
        });
      });
    });

    describe("exists", async () => {
      it("should return the correct value for valid tokens", async () => {
        for (let tokenId = StartTokenId; tokenId < 6 + StartTokenId; tokenId++) {
          expect(await erc721g.exists(tokenId)).to.eq(true);
        }
      });

      it("should return the correct value invalid tokens", async () => {
        expect(await erc721g.exists(100 + StartTokenId)).to.eq(false);
      });
    });

    describe("balanceOf", async () => {
      it("should return the amount for a given address", async () => {
        expect(await erc721g.balanceOf(owner.address)).to.equal("0");
        expect(await erc721g.balanceOf(addr1.address)).to.equal("1");
        expect(await erc721g.balanceOf(addr2.address)).to.equal("2");
        expect(await erc721g.balanceOf(addr3.address)).to.equal("3");
      });

      it("should revert, when query for the 0 address", async () => {
        await expect(erc721g.balanceOf(constants.AddressZero)).to.be.revertedWith(
          "ERC721: balance query for the zero address"
        );
      });
    });

    describe("_numberMinted", async () => {
      it("returns the amount for a given address", async () => {
        expect(await erc721g.numberMinted(owner.address)).to.equal("0");
        expect(await erc721g.numberMinted(addr1.address)).to.equal("1");
        expect(await erc721g.numberMinted(addr2.address)).to.equal("2");
        expect(await erc721g.numberMinted(addr3.address)).to.equal("3");
        expect(await erc721g.numberMinted(addr4.address)).to.equal("4");
      });
    });

    context("_totalMinted", async () => {
      it("has 10 totalMinted", async () => {
        expect(await erc721g.totalMinted()).to.equal("10");
      });
    });

    describe("aux", async () => {
      it("should get and set ownerAux works correctly", async () => {
        const uint136Max = "87112285931760246646623899502532662132735";
        expect(await erc721g.getOwnerAux(owner.address)).to.equal("0");
        await erc721g.setOwnerAux(owner.address, uint136Max);
        expect(await erc721g.getOwnerAux(owner.address)).to.equal(uint136Max);

        expect(await erc721g.getOwnerAux(addr1.address)).to.equal("0");
        await erc721g.setOwnerAux(addr1.address, "1");
        expect(await erc721g.getOwnerAux(addr1.address)).to.equal("1");

        await erc721g.setOwnerAux(addr3.address, "5");
        expect(await erc721g.getOwnerAux(addr3.address)).to.equal("5");

        expect(await erc721g.getOwnerAux(addr1.address)).to.equal("1");
      });

      it("should get and set tokenAux works correctly", async () => {
        const uint48Max = "281474976710655";
        expect(await erc721g.getTokenAux(StartTokenId)).to.equal(0);
        await erc721g.setTokenAux(StartTokenId, uint48Max);
        expect(await erc721g.getTokenAux(StartTokenId)).to.equal(281474976710655);

        expect(await erc721g.getTokenAux(StartTokenId + 1)).to.equal(0);
        await erc721g.setTokenAux(StartTokenId + 1, "1");
        expect(await erc721g.getTokenAux(StartTokenId + 1)).to.equal(1);

        await erc721g.setTokenAux(StartTokenId + 3, "5");
        expect(await erc721g.getTokenAux(StartTokenId + 3)).to.equal(5);

        expect(await erc721g.getTokenAux(StartTokenId + 1)).to.equal(1);
      });
    });

    describe("ownerOf", async () => {
      it("should return the correct owner", async () => {
        expect(await erc721g.ownerOf(0 + StartTokenId)).to.equal(addr1.address);
        expect(await erc721g.ownerOf(1 + StartTokenId)).to.equal(addr2.address);
        expect(await erc721g.ownerOf(5 + StartTokenId)).to.equal(addr3.address);
      });

      it("should revert, when query invalid token", async () => {
        await expect(erc721g.ownerOf(StartTokenId + 10)).to.be.revertedWith(
          "ERC721: owner query for nonexistent token"
        );
      });
    });

    describe("approve", async () => {
      const Token1 = StartTokenId;
      const Token2 = StartTokenId + 1;

      it("should set approval for the target address", async () => {
        await erc721g.connect(addr1).approve(addr2.address, Token1);
        const approval = await erc721g.getApproved(Token1);
        expect(approval).to.equal(addr2.address);
      });

      it("should revert, when approve to current owner", async () => {
        await expect(erc721g.connect(addr1).approve(addr2.address, Token2)).to.revertedWith(
          "ERC721: approval to current owner"
        );
      });

      it("should revert when caller not approved", async () => {
        await expect(erc721g.approve(addr2.address, Token1)).to.revertedWith(
          "ERC721: approve caller is not owner nor approved for all"
        );
      });

      it("should revert when get approved for invalid tokens", async () => {
        await expect(erc721g.getApproved(StartTokenId + 10)).to.revertedWith(
          "ERC721: approved query for nonexistent token"
        );
      });
    });

    describe("setApprovalForAll", async () => {
      it("should set approval for all properly", async () => {
        await expect(erc721g.setApprovalForAll(addr1.address, true))
          .to.emit(erc721g, "ApprovalForAll")
          .withArgs(owner.address, addr1.address, true);
        expect(await erc721g.isApprovedForAll(owner.address, addr1.address)).to.eq(true);
      });

      it("should revert, when set approvals for non msg senders", async () => {
        await expect(erc721g.connect(addr1).setApprovalForAll(addr1.address, true)).to.revertedWith(
          "ERC721: approve to caller"
        );
      });
    });

    context("transferFrom", function () {
      const TokenId = StartTokenId + 1;

      it("should revert, when transfer caller not approved", async () => {
        await expect(erc721g.connect(addr1).transferFrom(addr2.address, addr1.address, TokenId)).to.revertedWith(
          "ERC721: transfer caller is not owner nor approved"
        );
      });

      it("should revert, when transfer from incorrect owner", async () => {
        await erc721g.connect(addr2).setApprovalForAll(addr1.address, true);
        await expect(erc721g.connect(addr1).transferFrom(addr3.address, addr1.address, TokenId)).to.revertedWith(
          "ERC721: transfer from incorrect owner"
        );
      });

      it("should revert, when transfer to zero address", async () => {
        await erc721g.connect(addr2).setApprovalForAll(addr1.address, true);
        await expect(
          erc721g.connect(addr1).transferFrom(addr2.address, constants.AddressZero, TokenId)
        ).to.revertedWith("ERC721: transfer to the zero address");
      });

      it("should transfer correctly, when start from list head", async () => {
        // 6, 7, 8, 9
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 7),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 9))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 9));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 7),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 7),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([BigNumber.from(StartTokenId + 6)]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 6))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 6));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([]);
      });

      it("should transfer correctly, when start from list tail", async () => {
        // 6, 7, 8, 9
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 7),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 6))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 6));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 7),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([BigNumber.from(StartTokenId + 9)]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 9))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 9));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([]);
      });

      it("should transfer correctly, when start from list middle", async () => {
        // 6, 7, 8, 9
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 7),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 7));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 8),
          BigNumber.from(StartTokenId + 6),
        ]);
        await expect(
          erc721g.connect(addr4).transferFrom(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8))
        )
          .to.emit(erc721g, "Transfer")
          .withArgs(addr4.address, receiver.address, BigNumber.from(StartTokenId + 8));
        expect(await erc721g.tokensOfOwner(addr4.address, 4)).to.deep.eq([
          BigNumber.from(StartTokenId + 9),
          BigNumber.from(StartTokenId + 6),
        ]);
      });

      context("transfer succeed", async () => {
        const From = addr2.address;
        const To = addr3.address;

        beforeEach(async () => {
          await erc721g.connect(addr2).setApprovalForAll(To, true);
          expect(await erc721g.connect(addr2).transferFrom(From, To, TokenId))
            .to.emit(erc721g, "Transfer")
            .withArgs(From, To, TokenId)
            .to.emit(erc721g, "Approval")
            .withArgs(From, constants.AddressZero, TokenId);
        });

        it("the owner should change", async () => {
          expect(await erc721g.ownerOf(TokenId)).to.be.equal(To);
          expect(await erc721g.tokensOfOwner(From, 1000)).to.deep.eq([BigNumber.from(StartTokenId + 2)]);
          expect(await erc721g.tokensOfOwner(To, 1000)).to.deep.eq([
            BigNumber.from(StartTokenId + 2),
            BigNumber.from(StartTokenId + 5),
            BigNumber.from(StartTokenId + 4),
            BigNumber.from(StartTokenId + 3),
          ]);
        });

        it("the approval should be cleared", async () => {
          expect(await erc721g.getApproved(TokenId)).to.be.equal(constants.AddressZero);
        });

        it("the balance should be changed", async () => {
          expect(await erc721g.balanceOf(From)).to.be.equal(1);
          expect(await erc721g.balanceOf(To)).to.be.equal(4);
        });
      });
    });

    context("safeTransferFrom", function () {
      const TokenId = StartTokenId + 1;

      it("should revert, when transfer caller not approved", async () => {
        await expect(
          erc721g.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr2.address, addr1.address, TokenId)
        ).to.revertedWith("ERC721: transfer caller is not owner nor approved");
      });

      it("should revert, when transfer from incorrect owner", async () => {
        await erc721g.connect(addr2).setApprovalForAll(addr1.address, true);
        await expect(
          erc721g.connect(addr1)["safeTransferFrom(address,address,uint256)"](addr3.address, addr1.address, TokenId)
        ).to.revertedWith("ERC721: transfer from incorrect owner");
      });

      it("should revert, when transfer to zero address", async () => {
        await erc721g.connect(addr2).setApprovalForAll(addr1.address, true);
        await expect(
          erc721g
            .connect(addr1)
            ["safeTransferFrom(address,address,uint256)"](addr2.address, constants.AddressZero, TokenId)
        ).to.revertedWith("ERC721: transfer to the zero address");
      });

      it("should revert, when mint to non-receivers", async () => {
        await expect(
          erc721g.connect(addr2)["safeTransferFrom(address,address,uint256)"](addr2.address, erc721g.address, TokenId)
        ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
      });

      it("should revert, when mint to receivers returns wrong result", async () => {
        await expect(
          erc721g
            .connect(addr2)
            ["safeTransferFrom(address,address,uint256)"](addr2.address, receiverWrongReturn.address, TokenId)
        ).to.be.revertedWith("ERC721: transfer to non ERC721Receiver implementer");
      });

      it("should revert, when mint to receivers revert", async () => {
        await expect(
          erc721g
            .connect(addr2)
            ["safeTransferFrom(address,address,uint256)"](addr2.address, receiverRevert.address, TokenId)
        ).to.be.revertedWith("ReceiverMock revert");
      });

      context("transfer succeed", async () => {
        const From = addr2.address;
        const To = receiver.address;

        beforeEach(async () => {
          await erc721g.connect(addr2).setApprovalForAll(To, true);
          expect(await erc721g.connect(addr2)["safeTransferFrom(address,address,uint256)"](From, To, TokenId))
            .to.emit(erc721g, "Transfer")
            .withArgs(From, To, TokenId)
            .to.emit(erc721g, "Approval")
            .withArgs(From, constants.AddressZero, TokenId)
            .to.emit(To, "Received")
            .withArgs(From, To, TokenId, "0x", 20000);
        });

        it("the owner should change", async () => {
          expect(await erc721g.ownerOf(TokenId)).to.be.equal(To);
          expect(await erc721g.tokensOfOwner(From, 1000)).to.deep.eq([BigNumber.from(StartTokenId + 2)]);
          expect(await erc721g.tokensOfOwner(To, 1000)).to.deep.eq([BigNumber.from(StartTokenId + 2)]);
        });

        it("the approval should be cleared", async () => {
          expect(await erc721g.getApproved(TokenId)).to.be.equal(constants.AddressZero);
        });

        it("the balance should be changed", async () => {
          expect(await erc721g.balanceOf(From)).to.be.equal(1);
          expect(await erc721g.balanceOf(To)).to.be.equal(1);
        });
      });
    });

    describe("_burn", async () => {
      it("should burn if approvalCheck is false", async () => {
        await erc721g.connect(addr2).burn(StartTokenId, false);
        expect(await erc721g.exists(StartTokenId)).to.eq(false);
        expect(await erc721g.numberBurned(addr1.address)).to.eq(1);
      });

      it("should revert, when approvalCheck is true", async () => {
        await expect(erc721g.connect(addr2).burn(StartTokenId, true)).to.be.revertedWith(
          "ERC721Burnable: caller is not owner nor approved"
        );
      });
    });
  });

  context("mint", async () => {
    let owner: SignerWithAddress;

    beforeEach(async () => {
      [owner] = await ethers.getSigners();
    });

    context("safeMint", function () {
      it("should successfully mint a single token", async () => {
        await expect(erc721g.connect(owner)["safeMint(address,uint256)"](receiver.address, 1))
          .to.emit(erc721g, "Transfer")
          .withArgs(constants.AddressZero, receiver.address, StartTokenId)
          .to.emit(receiver, "Received")
          .withArgs(owner.address, constants.AddressZero, StartTokenId, "0x", 20000);
        expect(await erc721g.ownerOf(StartTokenId)).to.equal(receiver.address);
      });

      it("should successfully mint multiple tokens", async () => {
        const mintTx = await erc721g.connect(owner)["safeMint(address,uint256)"](receiver.address, 5);
        for (let tokenId = StartTokenId; tokenId < 5 + StartTokenId; tokenId++) {
          await expect(mintTx).to.emit(erc721g, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);
          await expect(mintTx)
            .to.emit(receiver, "Received")
            .withArgs(owner.address, constants.AddressZero, tokenId, "0x", 20000);
          expect(await erc721g.ownerOf(tokenId)).to.equal(receiver.address);
        }
      });

      it("should revert, when mint to the zero address", async () => {
        await expect(erc721g["safeMint(address,uint256)"](constants.AddressZero, 1)).to.be.revertedWith(
          "ERC721: mint to the zero address"
        );
      });

      it("should revert, when mint to non-receivers", async () => {
        await expect(erc721g["safeMint(address,uint256)"](erc721g.address, 1)).to.be.revertedWith(
          "ERC721: transfer to non ERC721Receiver implementer"
        );
      });

      it("should revert, when mint to receivers returns wrong result", async () => {
        await expect(erc721g["safeMint(address,uint256)"](receiverWrongReturn.address, 1)).to.be.revertedWith(
          "ERC721: transfer to non ERC721Receiver implementer"
        );
      });

      it("should revert, when mint to receivers revert", async () => {
        await expect(erc721g["safeMint(address,uint256)"](receiverRevert.address, 1)).to.be.revertedWith(
          "ReceiverMock revert"
        );
      });
    });

    context("mint", function () {
      it("should successfully mint a single token", async () => {
        await expect(erc721g.mint(receiver.address, 1))
          .to.emit(erc721g, "Transfer")
          .withArgs(constants.AddressZero, receiver.address, StartTokenId)
          .to.not.emit(receiver, "Received");
        expect(await erc721g.ownerOf(StartTokenId)).to.equal(receiver.address);
      });

      it("should successfully mint multiple tokens", async () => {
        const mintTx = await erc721g.mint(receiver.address, 5);
        for (let tokenId = StartTokenId; tokenId < 5 + StartTokenId; tokenId++) {
          await expect(mintTx).to.emit(erc721g, "Transfer").withArgs(constants.AddressZero, receiver.address, tokenId);
          await expect(mintTx).to.not.emit(receiver, "Received");
          expect(await erc721g.ownerOf(tokenId)).to.equal(receiver.address);
        }
      });

      it("should not revert for non-receivers", async () => {
        await erc721g.mint(erc721g.address, 1);
        expect(await erc721g.ownerOf(StartTokenId)).to.equal(erc721g.address);
      });

      it("should revert mints to the zero address", async () => {
        await expect(erc721g.mint(constants.AddressZero, 1)).to.be.revertedWith("ERC721: mint to the zero address");
      });
    });
  });
});
